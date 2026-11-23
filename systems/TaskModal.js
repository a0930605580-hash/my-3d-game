/**
 * TaskModal.js
 * 五大線索的互動操作、線索研讀、錯誤提示重試、文化解說回饋與印章頒發
 */

import { gameState, TASKS_CONFIG } from './GameState.js';
import { audioManager } from './AudioManager.js';

export class TaskModalManager {
  constructor(passportUI) {
    this.passportUI = passportUI;
    this.backdrop = document.getElementById('task-modal-backdrop');
    this.modalTitle = document.getElementById('task-modal-title');
    this.modalContent = document.getElementById('task-modal-content');
    this.closeBtn = document.getElementById('task-modal-close');

    this.currentTaskId = null;
    this.initEvents();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });
  }

  open(taskId) {
    this.currentTaskId = taskId;
    audioManager.playDiscover();
    this.renderTaskContent(taskId);
    this.backdrop.classList.add('active');
  }

  close() {
    this.backdrop.classList.remove('active');
    this.currentTaskId = null;
  }

  renderTaskContent(taskId) {
    const config = TASKS_CONFIG[taskId];
    if (!config) return;

    const hasCompleted = gameState.hasStamp(taskId);

    switch (taskId) {
      case 'task_hotspring':
        this.renderHotspringTask(hasCompleted);
        break;
      case 'task_produce':
        this.renderProduceTask(hasCompleted);
        break;
      case 'task_xietian_history':
        this.renderXietianTask(hasCompleted);
        break;
      case 'task_divination':
        this.renderDivinationTask(hasCompleted);
        break;
      case 'task_wufengqi':
        this.renderWufengqiTask(hasCompleted);
        break;
      default:
        break;
    }
  }

  // ================= 任務 1：湯圍溝美人湯湧泉 =================
  renderHotspringTask(hasCompleted) {
    this.modalTitle.innerHTML = `♨️ 湯圍溝溫泉公園 ｜ 美人湯湧泉之謎`;
    this.modalContent.innerHTML = `
      <div class="clue-hero-image-wrap">
        <img class="clue-hero-image" src="./assets/images/tangweigou_footbath.jpg" alt="湯圍溝溫泉公園足湯池實景" />
        <div class="image-caption-badge">實景踏查：湯圍溝溫泉公園公共足湯池</div>
      </div>

      <div class="clue-story-box">
        <strong>【線索告示牌記載】</strong><br>
        漫步在湯圍溝溫泉公園，石砌水渠白煙嫋嫋，水氣瀰漫著溫潤暖意。告示牌記載著礁溪溫泉的秘密：
        礁溪溫泉不同於陽明山或北投的山區硫磺溫泉，它是台灣極其罕見的「平原地下湧泉」，水質澄澈純淨、滑潤細緻。
      </div>

      ${hasCompleted ? this.getAlreadyCompletedBanner('美人湯湧泉印') : `
        <div class="task-question-title">【任務考驗】請觀察溫泉特性並回答：礁溪溫泉屬於何種泉質？具有何種特色？</div>
        <div class="options-list">
          <button class="option-btn" data-choice="A">
            <span class="option-prefix">A</span>
            <span><strong>弱鹼性碳酸氫鈉泉</strong>：無色無味無刺鼻硫磺臭，富含鈉、鎂、鈣等礦物質，洗後皮膚滑嫩清爽，素有「美人湯」美譽。</span>
          </button>
          <button class="option-btn" data-choice="B">
            <span class="option-prefix">B</span>
            <span><strong>強酸性青磺硫磺泉</strong>：帶有濃郁刺鼻的硫磺味，泉水偏灰青色，能腐蝕金屬飾品。</span>
          </button>
          <button class="option-btn" data-choice="C">
            <span class="option-prefix">C</span>
            <span><strong>高溫海底泥漿泉</strong>：含有大量深灰色天然火山泥，水溫超過 90 度，呈現泥狀混合水質。</span>
          </button>
        </div>

        <div id="task-feedback" class="feedback-box"></div>
      `}

      <div class="clue-culture-summary" style="margin-top: 18px; font-size: 0.9rem; color: #555; background: #fafafa; padding: 14px; border-radius: 8px;">
        <strong>【文化歷史溯源】</strong><br>
        礁溪溫泉源於雪山山脈的降雨，雨水深滲入地下深層地熱裂隙受熱，在蘭陽平原低窪處自然湧出。
        清代時稱「湯圍」，1898年日治時期在此設立公共浴場，發展出獨特的「溫泉鄉」休閒文化與生活步調。
      </div>
    `;

    if (!hasCompleted) {
      this.bindChoiceEvents('task_hotspring', 'A', {
        'B': '提示：硫磺味濃郁、呈青色的是北投青磺泉喔！礁溪溫泉完全無色無刺鼻異味，請再仔細觀察！',
        'C': '提示：泥漿泉是台南關子嶺溫泉的獨特景觀，礁溪泉水清澈透明如鏡！請重新選取！'
      });
    }
  }

  // ================= 任務 2：溫泉蔬菜特產籃 =================
  renderProduceTask(hasCompleted) {
    this.modalTitle.innerHTML = `🥬 湯圍溝溫泉公園 ｜ 溫泉產物：礁溪特產蔬菜籃`;
    this.modalContent.innerHTML = `
      <div class="clue-hero-image-wrap">
        <img class="clue-hero-image" src="./assets/images/produce_water_spinach.jpg" alt="礁溪特產空心菜實景" />
        <div class="image-caption-badge">實景踏查：礁溪溫泉特產空心菜（水蕹菜）</div>
      </div>

      <div class="clue-story-box">
        <strong>【特產菜籃觀察】</strong><br>
        礁溪農民善用富含礦物質且全年恆溫（約 25°C～30°C）的溫泉水引水灌溉農田，培育出馳名全台的「溫泉蔬菜」！
        菜籃中裝滿了礁溪三寶：溫泉空心菜、溫泉蔥與溫泉番茄。
      </div>

      ${hasCompleted ? this.getAlreadyCompletedBanner('溫泉四寶豐收印') : `
        <div class="task-question-title">【任務考驗】哪一種蔬菜利用溫泉水恆溫抗寒，特徵為「莖管粗大如拇指、纖維脆嫩爽口、下鍋炒不易變黑」，被譽為礁溪綠金傳奇？</div>
        
        <div class="produce-cards-grid">
          <div class="produce-card" data-choice="spinach">
            <img src="./assets/images/produce_water_spinach.jpg" alt="空心菜">
            <strong>溫泉空心菜（水蕹菜）</strong>
            <p style="font-size: 0.75rem; color:#666; margin-top:4px;">莖粗葉厚、脆嫩清甜</p>
          </div>
          <div class="produce-card" data-choice="scallion">
            <img src="./assets/images/produce_scallion.jpg" alt="溫泉蔥">
            <strong>礁溪溫泉蔥</strong>
            <p style="font-size: 0.75rem; color:#666; margin-top:4px;">蔥白長嫩、汁多辛甜</p>
          </div>
          <div class="produce-card" data-choice="tomato">
            <img src="./assets/images/produce_tomato.jpg" alt="溫泉番茄">
            <strong>溫泉桃太郎番茄</strong>
            <p style="font-size: 0.75rem; color:#666; margin-top:4px;">皮薄多汁、酸甜可口</p>
          </div>
        </div>

        <div id="task-feedback" class="feedback-box"></div>
      `}

      <div class="clue-culture-summary" style="margin-top: 18px; font-size: 0.9rem; color: #555; background: #fafafa; padding: 14px; border-radius: 8px;">
        <strong>【農業文化解說】</strong><br>
        傳統空心菜在台灣冬季低溫時難以生長，但礁溪農民引流溫泉回水，使水田維持在溫暖溫度，
        讓空心菜在冬天依舊生長茂盛，且培育出節間長、莖管粗、富含礦物質的絕佳口感，展現先民與自然共榮的在地智慧！
      </div>
    `;

    if (!hasCompleted) {
      const cards = this.modalContent.querySelectorAll('.produce-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          const choice = card.getAttribute('data-choice');
          if (choice === 'spinach') {
            this.handleTaskSuccess('task_produce', '溫泉四寶豐收印');
          } else if (choice === 'scallion') {
            this.showFeedback(false, '提示：溫泉蔥以長蔥白聞名，但「莖管粗大、炒不黑」的是水蕹菜（空心菜）喔！請再試一次！');
          } else {
            this.showFeedback(false, '提示：溫泉番茄是多汁的水果蔬菜，題目考驗的是管狀莖的綠色蔬菜！請再選一次！');
          }
        });
      });
    }
  }

  // ================= 任務 3：礁溪協天廟歷史與建築 =================
  renderXietianTask(hasCompleted) {
    this.modalTitle.innerHTML = `🏮 礁溪協天廟 ｜ 武聖威儀：協天廟歷史與建築巡禮`;
    this.modalContent.innerHTML = `
      <div class="clue-hero-image-wrap">
        <img class="clue-hero-image" src="./assets/images/xietian_temple_arch.jpg" alt="礁溪協天廟宏偉牌樓實景" />
        <div class="image-caption-badge">實景踏查：礁溪協天廟牌樓與正殿全景</div>
      </div>

      <div class="clue-story-box">
        <strong>【古蹟碑文記載】</strong><br>
        礁溪協天廟建於清嘉慶九年（西元 1804 年），主祀關聖帝君（武聖關公），是北台灣香火最鼎盛、極具歷史地位的關帝廟。
        廟宇建築氣勢恢宏，正殿屋頂展現閩南傳統工藝精髓，信徒遍及全台。
      </div>

      ${hasCompleted ? this.getAlreadyCompletedBanner('協天聖帝庇佑印') : `
        <div class="task-question-title">【任務考驗】觀察協天廟的建築藝術與民俗傳統，協天廟的屋頂呈現何種代表尊貴神格的傳統形制？且每年正月十三日協天廟最具特色的祈安祭儀是什麼？</div>
        <div class="options-list">
          <button class="option-btn" data-choice="A">
            <span class="option-prefix">A</span>
            <span>閩南式<strong>雙龍燕尾脊屋頂</strong>；且有全台聞名的<strong>「壽龜祭」</strong>（信徒以糯米、麵線或錢幣砌成祈福平安神龜供奉乞龜）。</span>
          </button>
          <button class="option-btn" data-choice="B">
            <span class="option-prefix">B</span>
            <span>西方巴洛克圓頂；且每年盛大施放<strong>天燈祈福</strong>。</span>
          </button>
          <button class="option-btn" data-choice="C">
            <span class="option-prefix">C</span>
            <span>哥德式高聳尖塔；且每年舉辦<strong>鹽水蜂炮</strong>遶境。</span>
          </button>
        </div>

        <div id="task-feedback" class="feedback-box"></div>
      `}

      <div class="clue-culture-summary" style="margin-top: 18px; font-size: 0.9rem; color: #555; background: #fafafa; padding: 14px; border-radius: 8px;">
        <strong>【信仰歷史解說】</strong><br>
        清嘉慶年間，開墾宜蘭的先民多來自福建漳州，面對荒蠻拓墾、疾疫與水患，迎請關聖帝君鎮守保境。
        協天廟每年春秋二祭及正月「壽龜祈福」，象徵長壽平安與忠義精神世代相傳。
      </div>
    `;

    if (!hasCompleted) {
      this.bindChoiceEvents('task_xietian_history', 'A', {
        'B': '提示：施放天燈是新北平溪的著名民俗，協天廟是正統閩南宮廟，最負盛名的是「壽龜祭」！',
        'C': '提示：蜂炮是台南鹽水武廟的民俗文化，協天廟以閩南木構燕尾屋脊與乞龜活動著稱！'
      });
    }
  }

  // ================= 任務 4：協天廟求筊與民俗體驗 =================
  renderDivinationTask(hasCompleted) {
    this.modalTitle.innerHTML = `🎋 礁溪協天廟 ｜ 心誠則靈：民俗擲筊祈福體驗`;
    this.modalContent.innerHTML = `
      <div class="clue-hero-image-wrap">
        <img class="clue-hero-image" src="./assets/images/xietian_temple_main.jpg" alt="協天廟大殿神案實景" />
        <div class="image-caption-badge">實景踏查：協天廟正殿聖祖殿神案</div>
      </div>

      <div class="clue-story-box">
        <strong>【民俗儀軌說明】</strong><br>
        走入協天廟大殿，信眾手持清香與紅檜筊杯。台灣民間傳統「擲筊」是人與神明溝通心意、祈求指點迷津的重要文化儀式。
        一對筊杯有凸面（俯/陰）與平面（仰/陽）。
      </div>

      ${hasCompleted ? this.getAlreadyCompletedBanner('心誠則靈吉祥印') : `
        <div class="divination-arena">
          <p style="font-weight:700; color:#475569;">【實地操作】誠心合十，默念祈福心願，按下按鈕擲下筊杯！</p>
          <div class="jiaobei-display" id="jiaobei-display-box">
            <div class="jiaobei-piece flat" id="j-left">仰面 (陽)</div>
            <div class="jiaobei-piece convex" id="j-right">俯面 (陰)</div>
          </div>
          <button class="btn-primary-action" id="btn-toss-jiaobei">🎲 誠心拋擲筊杯！</button>
        </div>

        <div id="divination-question-block" style="display:none; animation: fadeIn 0.4s ease;">
          <div class="task-question-title">【考驗回饋】筊杯落地呈「一凸面（俯）一平面（仰）」，在民俗中代表何種神聖寓意？</div>
          <div class="options-list">
            <button class="option-btn" data-choice="A">
              <span class="option-prefix">A</span>
              <span><strong>「聖筊」</strong>：神明應允、首肯與降福，代表事情吉祥順遂、心願得償。</span>
            </button>
            <button class="option-btn" data-choice="B">
              <span class="option-prefix">B</span>
              <span><strong>「笑筊」</strong>：神明微笑不語或事情未明，信眾應重新深思後再問。</span>
            </button>
            <button class="option-btn" data-choice="C">
              <span class="option-prefix">C</span>
              <span><strong>「陰筊 / 怒筊」</strong>：神明不贊同或斥責，不可行此方案。</span>
            </button>
          </div>
        </div>

        <div id="task-feedback" class="feedback-box"></div>
      `}

      <div class="clue-culture-summary" style="margin-top: 18px; font-size: 0.9rem; color: #555; background: #fafafa; padding: 14px; border-radius: 8px;">
        <strong>【民俗哲理啟示】</strong><br>
        擲筊並非迷信，而是讓人在焦慮疑惑時沉澱心緒、自我反省的智慧途徑。
        一陰一陽象徵太極陰陽相濟、天地和諧，亦蘊含敬天愛人、忠誠待人的美德。
      </div>
    `;

    if (!hasCompleted) {
      const tossBtn = document.getElementById('btn-toss-jiaobei');
      const qBlock = document.getElementById('divination-question-block');
      const jLeft = document.getElementById('j-left');
      const jRight = document.getElementById('j-right');

      tossBtn.addEventListener('click', () => {
        audioManager.playJiaobei();
        tossBtn.disabled = true;
        tossBtn.innerText = '拋擲中...';

        // 旋轉動態
        jLeft.style.transform = 'translateY(-20px) rotate(360deg)';
        jRight.style.transform = 'translateY(-20px) rotate(-360deg)';

        setTimeout(() => {
          jLeft.style.transform = 'translateY(0) rotate(-15deg)';
          jRight.style.transform = 'translateY(0) rotate(15deg)';
          tossBtn.innerText = '✨ 擲得一平一凸！請選擇答案';
          qBlock.style.display = 'block';
        }, 500);
      });

      this.bindChoiceEvents('task_divination', 'A', {
        'B': '提示：兩面皆平（雙仰）才叫「笑筊」喔！一平一凸是最吉祥的首肯！',
        'C': '提示：兩面皆凸（雙俯）才是「陰筊」，一陽一陰代表神靈首肯！請重新確認！'
      });
    }
  }

  // ================= 任務 5：五峰旗飛瀑地景拼圖 =================
  renderWufengqiTask(hasCompleted) {
    this.modalTitle.innerHTML = `🏞️ 五峰旗風景區 ｜ 飛瀑清音：五峰旗地景與生態拼圖`;
    this.modalContent.innerHTML = `
      <div class="clue-hero-image-wrap">
        <img class="clue-hero-image" src="./assets/images/wufengqi_falls.jpg" alt="五峰旗瀑布壯麗景觀實景" />
        <div class="image-caption-badge">實景踏查：五峰旗瀑布第二層與觀瀑亭實景</div>
      </div>

      <div class="clue-story-box">
        <strong>【山景明信片解讀】</strong><br>
        五峰旗風景區坐落於雪山山脈東麓，群山環抱，以壯麗的斷崖飛瀑名聞遐邇。
        相傳後方聳立的五座尖峰並列，極具辨識度；瀑布更分為三層，水氣豐沛，富含極高濃度的森林負離子。
      </div>

      ${hasCompleted ? this.getAlreadyCompletedBanner('五峰飛瀑清心印') : `
        <div class="task-question-title">【任務考驗】依據地景線索，五峰旗風景區得名由來為何？且全區瀑布共有幾層，哪一層高達約 50 公尺最為壯麗？</div>
        <div class="options-list">
          <button class="option-btn" data-choice="A">
            <span class="option-prefix">A</span>
            <span>因瀑布後方聳立<strong>五座尖峰並列宛如將軍背後之三角軍旗</strong>；共有<strong>三層瀑布</strong>，以<strong>第一層瀑布</strong>（高約 50 公尺絕壁狂瀉）最為壯麗。</span>
          </button>
          <button class="option-btn" data-choice="B">
            <span class="option-prefix">B</span>
            <span>因清代駐軍插了五面彩色錦旗而得名；全區只有<strong>單一階層</strong>瀑布。</span>
          </button>
          <button class="option-btn" data-choice="C">
            <span class="option-prefix">C</span>
            <span>因當地有五種保育類旗魚而命名；瀑布共有<strong>七層階梯</strong>。</span>
          </button>
        </div>

        <div id="task-feedback" class="feedback-box"></div>
      `}

      <div class="clue-culture-summary" style="margin-top: 18px; font-size: 0.9rem; color: #555; background: #fafafa; padding: 14px; border-radius: 8px;">
        <strong>【地質與生態解說】</strong><br>
        五峰旗瀑布為斷層活動造成的斷崖型瀑布：
        第三層最下層水勢平緩設有親水區；第二層旁建有「五峰亭」可臨近感受飛濺水霧；
        第一層自數十公尺垂直岩壁傾瀉，雷霆萬鈞，每立方公分負離子高達數萬個，是身心療癒的天然氧吧。
      </div>
    `;

    if (!hasCompleted) {
      this.bindChoiceEvents('task_wufengqi', 'A', {
        'B': '提示：五峰旗之名源自大自然的「五座尖削山峰」，且瀑布是經典的三層遞進喔！',
        'C': '提示：旗魚是海魚，這裡地處雪山山脈山麓，以宛如三角令旗的山勢著稱！請再試一次！'
      });
    }
  }

  // 綁定選項點擊事件
  bindChoiceEvents(taskId, correctChoice, errorHints) {
    const buttons = this.modalContent.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-choice');
        if (choice === correctChoice) {
          const config = TASKS_CONFIG[taskId];
          this.handleTaskSuccess(taskId, config.stampName);
        } else {
          const hint = errorHints[choice] || '答錯囉！請仔細研讀線索告示牌並重新思考！';
          this.showFeedback(false, hint);
        }
      });
    });
  }

  // 處理任務通關與頒發印章
  handleTaskSuccess(taskId, stampName) {
    audioManager.playCorrect();
    const isNewStamp = gameState.awardStamp(taskId);

    this.showFeedback(true, `🎉 太棒了！回答正確！成功獲得專屬印章：【${stampName}】！已登錄於文化護照中！`);

    setTimeout(() => {
      audioManager.playStamp();
      if (this.passportUI) {
        this.passportUI.render();
      }
    }, 400);

    setTimeout(() => {
      this.close();
      if (isNewStamp && this.passportUI) {
        this.passportUI.open();
      }
    }, 1400);
  }

  // 顯示反饋提示
  showFeedback(isSuccess, message) {
    const fb = document.getElementById('task-feedback');
    if (!fb) return;
    fb.className = `feedback-box ${isSuccess ? 'success' : 'error'}`;
    fb.innerHTML = `<strong>${isSuccess ? '✓ 通關回饋' : '⚠ 提示與重試'}：</strong> ${message}`;
    fb.style.display = 'block';

    if (!isSuccess) {
      audioManager.playWrong();
    }
  }

  // 已完成之印章橫幅
  getAlreadyCompletedBanner(stampName) {
    return `
      <div style="background: #e8f5e9; border: 2px solid #81c784; border-radius: 12px; padding: 14px 18px; text-align: center; margin: 16px 0; color: #2e7d32;">
        <span style="font-size: 1.4rem;">🏅</span>
        <strong style="font-size: 1.05rem; margin-left: 6px;">本項任務已順利完成！</strong>
        <p style="font-size: 0.85rem; margin-top: 4px; color: #388e3c;">已取得【${stampName}】！同一關卡不重複計印。可隨時打開文化護照複習手帳。</p>
      </div>
    `;
  }
}
