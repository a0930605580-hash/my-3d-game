/**
 * main.js
 * 礁溪尋寶：溫泉小鎮的祕密任務 - 核心遊戲引擎主程式
 */

import * as THREE from 'three';
import { SceneManager } from './world/SceneManager.js';
import { LandmarksManager } from './world/Landmarks.js';
import { Player } from './world/Player.js';
import { ClueObjectsManager } from './world/ClueObjects.js';

import { gameState } from './systems/GameState.js';
import { audioManager } from './systems/AudioManager.js';
import { TaskModalManager } from './systems/TaskModal.js';
import { PassportUI } from './systems/PassportUI.js';
import { TreasureBoxUI } from './systems/TreasureBoxUI.js';
import { Minimap } from './systems/Minimap.js';

class JiaoxiTreasureGame {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // 1. 初始化 3D 場景
    this.sceneManager = new SceneManager(this.container);

    // 2. 初始化 3D 核心地標（任務板、寶箱、湯圍溝、協天廟、五峰旗）
    this.landmarks = new LandmarksManager(this.sceneManager.scene);

    // 3. 初始化旅人主角與相機
    this.player = new Player(
      this.sceneManager.scene,
      this.sceneManager.camera,
      this.sceneManager.renderer.domElement
    );

    // 4. 初始化 UI 系統
    this.passportUI = new PassportUI();
    this.treasureBoxUI = new TreasureBoxUI(this.player);
    this.treasureBoxUI.chestObject3D = this.landmarks.treasureChest;
    this.taskModal = new TaskModalManager(this.passportUI);
    this.minimap = new Minimap(this.player);

    // 5. 初始化 3D 線索物件與互動
    this.clues = new ClueObjectsManager(
      this.sceneManager.scene,
      this.sceneManager.camera,
      this.taskModal,
      this.treasureBoxUI
    );

    // 6. 綁定 HUD 快捷功能
    this.bindHudControls();

    // 7. 啟動渲染循環
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    console.log('礁溪尋寶遊戲已成功初始化！');
  }

  bindHudControls() {
    // 快速傳送按鈕（便利評分與影片錄製）
    const fastTravelMap = {
      'btn-ft-plaza': { x: 0, z: 5, name: '迎賓任務板' },
      'btn-ft-tang': { x: -55, z: 20, name: '湯圍溝公園' },
      'btn-ft-xie': { x: 8, z: 75, name: '礁溪協天廟' },
      'btn-ft-wu': { x: 65, z: -62, name: '五峰旗瀑布' }
    };

    Object.keys(fastTravelMap).forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          const target = fastTravelMap[btnId];
          this.player.teleportTo(target.x, target.z);
          audioManager.playDiscover();
        });
      }
    });

    // 音效靜音切換
    const muteBtn = document.getElementById('btn-toggle-sound');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = audioManager.toggleMute();
        muteBtn.innerHTML = isMuted ? '🔇 靜音' : '🔊 音效';
      });
    }

    // 點擊任一處主動啟用 Web Audio
    window.addEventListener('click', () => {
      audioManager.init();
    }, { once: true });
    window.addEventListener('keydown', () => {
      audioManager.init();
    }, { once: true });

    // 提示卡同步更新
    const hintText = document.getElementById('hud-hint-text');
    gameState.subscribe((state) => {
      if (hintText) {
        hintText.innerText = state.nextHint;
      }
    });
    if (hintText) {
      hintText.innerText = gameState.getNextHint();
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 更新角色
    this.player.update(delta);

    // 更新地標粒子
    this.landmarks.update(delta);

    // 更新線索物件呼吸與距離判定
    this.clues.update(this.player.getPosition(), elapsedTime);

    // 更新小地圖
    this.minimap.update();

    // 渲染場景
    this.sceneManager.render();
  }
}

// 頁面載入完成後啟動
window.addEventListener('DOMContentLoaded', () => {
  new JiaoxiTreasureGame();
});
