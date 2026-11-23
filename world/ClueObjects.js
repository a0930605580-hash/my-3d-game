/**
 * ClueObjects.js
 * 3D 互動線索物件管理器：
 * 放置 5 大可操作文化線索與寶箱互動判定、動態呼吸光環與鄰近提示
 */

import * as THREE from 'three';
import { TASKS_CONFIG } from '../systems/GameState.js';

export class ClueObjectsManager {
  constructor(scene, camera, taskModal, treasureBoxUI) {
    this.scene = scene;
    this.camera = camera;
    this.taskModal = taskModal;
    this.treasureBoxUI = treasureBoxUI;

    this.clues = [];
    this.interactiveMeshes = [];
    this.activePromptClue = null;

    this.promptBanner = document.getElementById('prompt-banner');

    this.buildClueObjects();
    this.initInteractionEvents();
  }

  buildClueObjects() {
    const clueConfigs = [
      {
        id: 'task_hotspring',
        x: -56,
        z: 16,
        type: 'signboard',
        icon: '♨️',
        label: '調查：溫泉解說告示牌'
      },
      {
        id: 'task_produce',
        x: -64,
        z: 24,
        type: 'basket',
        icon: '🥬',
        label: '調查：溫泉農特產菜籃'
      },
      {
        id: 'task_xietian_history',
        x: 6,
        z: 72,
        type: 'stone_tablet',
        icon: '📜',
        label: '研讀：協天廟文化解說石碑'
      },
      {
        id: 'task_divination',
        x: 12,
        z: 84,
        type: 'divination_table',
        icon: '🎋',
        label: '祈福：聖意籤筒與求筊台'
      },
      {
        id: 'task_wufengqi',
        x: 72,
        z: -64,
        type: 'postcard_board',
        icon: '🏞️',
        label: '觀察：山景明信片與地質拼圖板'
      }
    ];

    clueConfigs.forEach(cfg => {
      const clueGroup = new THREE.Group();
      clueGroup.position.set(cfg.x, 0, cfg.z);

      // 地面光環
      const ringGeo = new THREE.RingGeometry(1.2, 1.5, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      clueGroup.add(ring);

      // 依類型建立 3D 線索主體模型
      const mesh = this.createSpecificClueMesh(cfg.type);
      clueGroup.add(mesh);

      // 懸浮 3D 浮動圖標 Sprite
      const sprite = this.createIconSprite(cfg.icon);
      sprite.position.y = 2.8;
      clueGroup.add(sprite);

      clueGroup.userData = {
        isClue: true,
        taskId: cfg.id,
        label: cfg.label,
        ringMesh: ring,
        spriteMesh: sprite
      };

      this.scene.add(clueGroup);
      this.clues.push(clueGroup);
      this.interactiveMeshes.push(clueGroup);
    });
  }

  createSpecificClueMesh(type) {
    const group = new THREE.Group();

    if (type === 'signboard') {
      // 溫泉解說牌
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8), new THREE.MeshStandardMaterial({ color: 0x5d4037 }));
      stand.position.y = 0.9;
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.1), new THREE.MeshStandardMaterial({ color: 0xecf0f1 }));
      board.position.set(0, 1.4, 0);
      group.add(stand, board);
    } else if (type === 'basket') {
      // 竹編特產菜籃
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.9 }));
      basket.position.y = 0.4;
      const greens = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), new THREE.MeshStandardMaterial({ color: 0x27ae60 }));
      greens.position.y = 0.8;
      group.add(basket, greens);
    } else if (type === 'stone_tablet') {
      // 廟宇石碑
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.8), new THREE.MeshStandardMaterial({ color: 0x7f8c8d }));
      base.position.y = 0.2;
      const tablet = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.3), new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.7 }));
      tablet.position.y = 1.2;
      group.add(base, tablet);
    } else if (type === 'divination_table') {
      // 求筊案桌
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.0), new THREE.MeshStandardMaterial({ color: 0xc0392b }));
      table.position.y = 0.5;
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6 }));
      tube.position.set(0.3, 1.35, 0);
      group.add(table, tube);
    } else {
      // 山景明信片與拼圖板
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6), new THREE.MeshStandardMaterial({ color: 0x4b6584 }));
      stand.position.y = 0.8;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      frame.position.set(0, 1.4, 0);
      group.add(stand, frame);
    }

    return group;
  }

  createIconSprite(iconChar) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // 圓形黃金光環背景
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconChar, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.6, 1.6, 1);
    return sprite;
  }

  initInteractionEvents() {
    // 鍵盤按下 E 鍵調查當前鄰近線索或寶箱
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        this.triggerCurrentInteraction();
      }
    });

    // 點擊底部提示橫幅亦可調查
    if (this.promptBanner) {
      this.promptBanner.addEventListener('click', () => {
        this.triggerCurrentInteraction();
      });
    }

    // 滑鼠點擊 3D 物件 Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', (e) => {
      // 避免點擊 HUD 介面觸發
      if (e.target.closest('#hud-overlay') || e.target.closest('.modal-backdrop')) return;

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children, true);

      for (let i = 0; i < intersects.length; i++) {
        let obj = intersects[i].object;
        while (obj && !obj.userData?.isClue && !obj.userData?.isChest) {
          obj = obj.parent;
        }
        if (obj) {
          if (obj.userData.isClue) {
            this.taskModal.open(obj.userData.taskId);
            break;
          } else if (obj.userData.isChest) {
            this.treasureBoxUI.interactWithChest(obj);
            break;
          }
        }
      }
    });
  }

  triggerCurrentInteraction() {
    if (!this.activePromptClue) return;

    if (this.activePromptClue.type === 'clue') {
      this.taskModal.open(this.activePromptClue.data.taskId);
    } else if (this.activePromptClue.type === 'chest') {
      this.treasureBoxUI.interactWithChest(this.activePromptClue.data);
    }
  }

  // 每幀更新：呼吸光效與玩家距離判定
  update(playerPos, time) {
    let nearestClue = null;
    let minDistance = Infinity;

    // 1. 檢查 5 大線索距離
    this.clues.forEach(clue => {
      const dist = playerPos.distanceTo(clue.position);

      // 光環旋轉與呼吸微動
      if (clue.userData.ringMesh) {
        clue.userData.ringMesh.rotation.z += 0.015;
      }
      if (clue.userData.spriteMesh) {
        clue.userData.spriteMesh.position.y = 2.8 + Math.sin(time * 3 + clue.position.x) * 0.2;
      }

      if (dist < 6.5 && dist < minDistance) {
        minDistance = dist;
        nearestClue = {
          type: 'clue',
          data: clue.userData,
          distance: dist
        };
      }
    });

    // 2. 檢查文化寶箱距離 (0, 0, 2.5)
    const chestPos = new THREE.Vector3(0, 0, 2.5);
    const chestDist = playerPos.distanceTo(chestPos);
    if (chestDist < 5.0 && chestDist < minDistance) {
      nearestClue = {
        type: 'chest',
        data: this.treasureBoxUI.chestObject3D || { userData: {} },
        distance: chestDist,
        label: '開啟：文化寶箱（集滿 5 枚印章）'
      };
    }

    // 3. 更新提示條
    if (nearestClue) {
      this.activePromptClue = nearestClue;
      if (this.promptBanner) {
        const text = nearestClue.type === 'chest' 
          ? `🎁 按 <span class="key-badge">E</span> 或點擊開啟：<strong>【文化寶箱】</strong>`
          : `🔍 按 <span class="key-badge">E</span> 或點擊進行：<strong>【${nearestClue.data.label}】</strong>`;
        this.promptBanner.innerHTML = text;
        this.promptBanner.classList.remove('hidden');
      }
    } else {
      this.activePromptClue = null;
      if (this.promptBanner) {
        this.promptBanner.classList.add('hidden');
      }
    }
  }
}
