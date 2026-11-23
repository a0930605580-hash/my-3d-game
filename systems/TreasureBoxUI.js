/**
 * TreasureBoxUI.js
 * 文化寶箱開箱盛典、金光特效、彩帶噴發、數位徽章頒發與「重新遊玩」重置流程
 */

import confetti from 'canvas-confetti';
import { gameState } from './GameState.js';
import { audioManager } from './AudioManager.js';

export class TreasureBoxUI {
  constructor(player) {
    this.player = player;
    this.modalBackdrop = document.getElementById('victory-modal-backdrop');
    this.closeBtn = document.getElementById('victory-modal-close');
    this.replayBtn = document.getElementById('btn-replay-game');
    this.printBtn = document.getElementById('btn-print-certificate');

    this.initEvents();
  }

  initEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => this.handleReplay());
    }
    if (this.printBtn) {
      this.printBtn.addEventListener('click', () => {
        window.print();
      });
    }
    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) this.close();
      });
    }
  }

  // 嘗試與寶箱互動
  interactWithChest(chestObject3D) {
    const state = gameState.getState();

    if (state.stampsCount < 5) {
      audioManager.playWrong();
      const remain = 5 - state.stampsCount;
      alert(`🔒【文化寶箱上鎖中】\n\n您目前已收集 ${state.stampsCount} / 5 枚印章。\n還需要再收集 ${remain} 枚印章才能開啟寶箱！\n\n下一步提示：\n${state.nextHint}`);
      return;
    }

    // 條件滿足：集滿 5 枚印章，開啟寶箱！
    gameState.openChest();
    audioManager.playChestFanfare();

    // 寶箱 3D 掀蓋動畫（如果 3D 物件提供蓋子）
    if (chestObject3D && chestObject3D.userData && chestObject3D.userData.openAnim) {
      chestObject3D.userData.openAnim();
    }

    // 噴發彩帶灑金粉
    this.launchConfetti();

    // 彈出數位徽章頒發視窗
    setTimeout(() => {
      this.openVictoryModal();
    }, 600);
  }

  launchConfetti() {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 300);
  }

  openVictoryModal() {
    const today = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const certDate = document.getElementById('cert-date');
    if (certDate) certDate.innerText = today;

    this.modalBackdrop.classList.add('active');
  }

  close() {
    this.modalBackdrop.classList.remove('active');
  }

  // 重新遊玩：重置護照回到 0 / 5 並將角色傳送回起始廣場
  handleReplay() {
    const confirmReset = confirm('確定要重新遊玩嗎？\n\n護照印章與寶箱進度將全數重置為 0 / 5，角色將回到中央迎賓任務板。');
    if (!confirmReset) return;

    gameState.resetGame();
    audioManager.playDiscover();

    if (this.player) {
      this.player.teleportTo(0, 0); // 傳送回中央廣場迎賓板前
    }

    this.close();

    const banner = document.getElementById('prompt-banner');
    if (banner) {
      banner.innerHTML = `✨ <strong>護照進度已重置為 0 / 5！</strong> 歡迎再次啟程探索礁溪！`;
      banner.classList.remove('hidden');
      setTimeout(() => {
        banner.classList.add('hidden');
      }, 4000);
    }
  }
}
