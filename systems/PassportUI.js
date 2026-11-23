/**
 * PassportUI.js
 * 「礁溪文化尋寶護照」界面系統
 * 呈現 5 大任務印章、集章進度、下一步引導與實景文化踏查手帳
 */

import { gameState, TASKS_CONFIG } from './GameState.js';
import { audioManager } from './AudioManager.js';

export class PassportUI {
  constructor() {
    this.backdrop = document.getElementById('passport-modal-backdrop');
    this.closeBtn = document.getElementById('passport-modal-close');
    this.passportContent = document.getElementById('passport-modal-body');
    this.triggerBtn = document.getElementById('hud-passport-btn');
    this.progressPill = document.getElementById('hud-progress-pill');
    this.currentTab = 'stamps'; // 'stamps' | 'journal' | 'guide'

    this.initEvents();
    this.render();
  }

  initEvents() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.toggle());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) this.close();
      });
    }

    // 按鍵快捷鍵 P 開啟護照
    window.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P') {
        const isTaskOpen = document.getElementById('task-modal-backdrop')?.classList.contains('active');
        if (!isTaskOpen) this.toggle();
      }
    });

    // 訂閱遊戲狀態自動更新
    gameState.subscribe(() => {
      this.render();
    });
  }

  toggle() {
    if (this.backdrop.classList.contains('active')) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    audioManager.playDiscover();
    this.render();
    this.backdrop.classList.add('active');
  }

  close() {
    this.backdrop.classList.remove('active');
  }

  render() {
    const state = gameState.getState();

    // 更新 HUD 印章徽章計數
    if (this.progressPill) {
      this.progressPill.innerText = `${state.stampsCount} / 5`;
    }

    // 渲染護照內部
    if (!this.passportContent) return;

    this.passportContent.innerHTML = `
      <!-- 護照頂部頁籤 -->
      <div class="passport-tabs">
        <button class="tab-btn ${this.currentTab === 'stamps' ? 'active' : ''}" data-tab="stamps">📖 尋寶印章集 (${state.stampsCount}/5)</button>
        <button class="tab-btn ${this.currentTab === 'journal' ? 'active' : ''}" data-tab="journal">📷 實景文化手帳</button>
        <button class="tab-btn ${this.currentTab === 'guide' ? 'active' : ''}" data-tab="guide">🗺️ 任務規則與寶箱說明</button>
      </div>

      ${this.currentTab === 'stamps' ? this.renderStampsTab(state) : ''}
      ${this.currentTab === 'journal' ? this.renderJournalTab() : ''}
      ${this.currentTab === 'guide' ? this.renderGuideTab(state) : ''}
    `;

    // 頁籤切換事件
    const tabBtns = this.passportContent.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTab = btn.getAttribute('data-tab');
        this.render();
      });
    });
  }

  // 渲染「尋寶印章集」頁面
  renderStampsTab(state) {
    const taskKeys = Object.keys(TASKS_CONFIG);

    const slotsHtml = taskKeys.map((taskId) => {
      const task = TASKS_CONFIG[taskId];
      const isUnlocked = gameState.hasStamp(taskId);

      return `
        <div class="stamp-slot ${isUnlocked ? 'unlocked' : ''}">
          <div class="stamp-icon">${task.stampIcon}</div>
          <div class="stamp-title">${task.stampName}</div>
          <div style="font-size:0.65rem; color:#95a5a6; margin-top:2px;">${task.location}</div>
          ${isUnlocked 
            ? `<div class="stamp-seal-badge">✓ 已認證</div>` 
            : `<div style="font-size:0.65rem; color:#b2bec3; margin-top:4px;">未解鎖</div>`
          }
        </div>
      `;
    }).join('');

    return `
      <div style="background: white; border: 1px solid #dcdde1; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 10px;">
          <div>
            <h3 style="color:#962d22; font-size:1.1rem; font-weight:800;">礁溪文化尋寶護照</h3>
            <span style="font-size:0.75rem; color:#7f8c8d;">發證機關：宜蘭礁溪文史探索委員會 ｜ 旅人專屬數位通行證</span>
          </div>
          <div style="text-align: right;">
            <div style="font-size:1.25rem; font-weight:900; color:${state.isCompleted ? '#27ae60' : '#c0392b'};">
              ${state.stampsCount} / 5 印章
            </div>
            <div style="font-size:0.75rem; color:#7f8c8d;">${state.isCompleted ? '已具備開箱資格！' : '尚未集滿'}</div>
          </div>
        </div>

        <!-- 5 枚印章槽 -->
        <div class="passport-grid">
          ${slotsHtml}
        </div>
      </div>

      <!-- 下一步智慧導航引導 -->
      <div class="hint-card" style="max-width: 100%; border-left: 5px solid #2980b9;">
        <div class="hint-title" style="color: #2980b9;">🧭 下一步任務指南</div>
        <div class="hint-text" style="font-size: 0.95rem; line-height: 1.5; margin-top: 4px;">
          ${state.nextHint}
        </div>
      </div>
    `;
  }

  // 渲染「實景文化手帳」頁面
  renderJournalTab() {
    return `
      <div style="margin-bottom: 12px;">
        <p style="font-size:0.88rem; color:#555;">
          本遊戲嚴格依據真實地理與文史考證，嚴選礁溪代表性景致與特產實景照片，打造深度文化旅行手帳：
        </p>
      </div>

      <div class="photo-gallery-grid">
        <div class="gallery-card">
          <img src="./assets/images/tangweigou_footbath.jpg" alt="湯圍溝足浴池">
          <div class="gallery-card-body">
            <div class="gallery-card-title">♨️ 湯圍溝溫泉足湯池</div>
            <div class="gallery-card-desc">全台罕見平原地下湧泉，富含礦物質碳酸氫鈉泉，水溫約 50°C，無硫磺刺鼻味。</div>
          </div>
        </div>

        <div class="gallery-card">
          <img src="./assets/images/tangweigou_bathhouse.jpg" alt="湯圍風呂">
          <div class="gallery-card-body">
            <div class="gallery-card-title">♨️ 湯圍風呂木造浴場</div>
            <div class="gallery-card-desc">日治時期 1898 年設立公共浴場，承襲百年溫泉生活美學與日式檜木建築風格。</div>
          </div>
        </div>

        <div class="gallery-card">
          <img src="./assets/images/xietian_temple_arch.jpg" alt="協天廟牌樓">
          <div class="gallery-card-body">
            <div class="gallery-card-title">🏮 礁溪協天廟宏偉牌樓</div>
            <div class="gallery-card-desc">建於清嘉慶九年（1804年），北台灣香火最鼎盛關帝廟，守護開墾移民忠義之風。</div>
          </div>
        </div>

        <div class="gallery-card">
          <img src="./assets/images/xietian_temple_main.jpg" alt="協天廟聖祖殿">
          <div class="gallery-card-body">
            <div class="gallery-card-title">🏮 協天廟閩南燕尾脊</div>
            <div class="gallery-card-desc">屋脊如燕尾飛揚展現崇高神格，每年正月十三日舉辦「壽龜祭」為信眾求吉祈安。</div>
          </div>
        </div>

        <div class="gallery-card">
          <img src="./assets/images/wufengqi_falls.jpg" alt="五峰旗瀑布">
          <div class="gallery-card-body">
            <div class="gallery-card-title">🏞️ 五峰旗瀑布與觀瀑亭</div>
            <div class="gallery-card-desc">雪山山脈斷崖斷層形成三層瀑布，第二層旁建有五峰亭，負離子含量傲視北台灣。</div>
          </div>
        </div>

        <div class="gallery-card">
          <img src="./assets/images/wufengqi_first_fall.jpg" alt="五峰旗第一層瀑布">
          <div class="gallery-card-body">
            <div class="gallery-card-title">🏞️ 五峰旗第一層絕壁飛瀑</div>
            <div class="gallery-card-desc">高達約 50 公尺自垂直岩壁狂瀉，後方五座並列尖峰宛如古代將軍背後之三角軍旗。</div>
          </div>
        </div>

        <div class="gallery-card">
          <img src="./assets/images/produce_water_spinach.jpg" alt="礁溪溫泉空心菜">
          <div class="gallery-card-body">
            <div class="gallery-card-title">🥬 礁溪溫泉空心菜（水蕹菜）</div>
            <div class="gallery-card-desc">利用 25-30°C 溫泉水恆溫抗寒越冬灌溉，形成粗大管莖、口感脆嫩且下鍋不易黑。</div>
          </div>
        </div>

        <div class="gallery-card">
          <img src="./assets/images/produce_scallion.jpg" alt="礁溪溫泉青蔥">
          <div class="gallery-card-body">
            <div class="gallery-card-title">🥬 礁溪溫泉青蔥</div>
            <div class="gallery-card-desc">溫泉水地氣與肥沃沖積扇土壤培育，蔥白極長、多汁鮮甜無辛辣刺鼻感。</div>
          </div>
        </div>

        <div class="gallery-card">
          <img src="./assets/images/produce_tomato.jpg" alt="礁溪溫泉番茄">
          <div class="gallery-card-body">
            <div class="gallery-card-title">🍅 礁溪溫泉桃太郎番茄</div>
            <div class="gallery-card-desc">冬春特產溫泉蔬菜，皮薄汁多、酸甜濃郁，富含礦物質與茄紅素。</div>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染「任務規則與寶箱說明」頁面
  renderGuideTab(state) {
    return `
      <div style="line-height: 1.7; font-size: 0.95rem; color: #2c3e50;">
        <h4 style="color:#962d22; font-weight:800; font-size:1.05rem; margin-bottom:8px;">🎁 尋寶終極目標：文化寶箱與數位徽章</h4>
        <p>
          玩家扮演初訪礁溪的旅人，攜帶這本文化尋寶護照走訪三大地標：
          <strong>湯圍溝溫泉公園</strong>、<strong>礁溪協天廟</strong>、<strong>五峰旗風景區</strong>。
        </p>
        <p style="margin-top:8px;">
          每個景點均設有文化線索（告示牌、特產菜籃、文化碑文、籤筒求筊、地景拼圖板）。
          仔細觀察閱讀後操作答題，完成即可解鎖印章。答錯時系統會提供溫和提示，可以無限次重試直到領悟文化奧妙！
        </p>
        <div style="background:#fff3cd; border:1px solid #ffeeba; padding:12px 16px; border-radius:8px; margin:14px 0; color:#856404;">
          <strong>🎯 開箱條件：</strong><br>
          集滿全數 5 枚印章（當前進度：<strong>${state.stampsCount} / 5</strong>）後，返回中央迎賓廣場點擊【文化寶箱】，
          寶箱即會解鎖金光綻放，頒發專屬的<strong>「礁溪文化旅人」</strong>數位榮譽徽章！
        </div>
        <p style="font-size:0.85rem; color:#7f8c8d;">
          ※ 如需重溫挑戰，在取得徽章結算畫面或點擊選單均可隨時「重新遊玩」，護照進度將重置為 0 / 5。
        </p>
      </div>
    `;
  }
}
