/**
 * GameState.js
 * 核心遊戲狀態管理：護照進度、印章收集、下一步提示與重新遊玩重置
 */

export const TASKS_CONFIG = {
  task_hotspring: {
    id: 'task_hotspring',
    location: '湯圍溝溫泉公園',
    locationId: 'tangweigou',
    title: '美人湯湧泉之謎',
    clueName: '溫泉解說告示牌',
    stampId: 'stamp_hotspring',
    stampName: '美人湯湧泉印',
    stampIcon: '♨️',
    description: '探究礁溪特有的平原低溫地下碳酸氫鈉泉水質特性。'
  },
  task_produce: {
    id: 'task_produce',
    location: '湯圍溝溫泉公園',
    locationId: 'tangweigou',
    title: '溫泉產物：礁溪特產蔬菜籃',
    clueName: '溫泉農特產菜籃',
    stampId: 'stamp_produce',
    stampName: '溫泉四寶豐收印',
    stampIcon: '🥬',
    description: '辨識利用溫泉溫水灌溉培育的礁溪特產蔬菜。'
  },
  task_xietian_history: {
    id: 'task_xietian_history',
    location: '礁溪協天廟',
    locationId: 'xietian',
    title: '武聖威儀：協天廟歷史與建築巡禮',
    clueName: '廟宇文化解說石碑',
    stampId: 'stamp_xietian',
    stampName: '協天聖帝庇佑印',
    stampIcon: '🏮',
    description: '深入了解清嘉慶年間建廟歷史、燕尾脊建築與壽龜祭典。'
  },
  task_divination: {
    id: 'task_divination',
    location: '礁溪協天廟',
    locationId: 'xietian',
    title: '心誠則靈：民俗擲筊祈福體驗',
    clueName: '聖意籤筒與求筊台',
    stampId: 'stamp_divination',
    stampName: '心誠則靈吉祥印',
    stampIcon: '🎋',
    description: '體會台灣傳統民間信仰之「聖筊」意涵與求福哲理。'
  },
  task_wufengqi: {
    id: 'task_wufengqi',
    location: '五峰旗風景區',
    locationId: 'wufengqi',
    title: '飛瀑清音：五峰旗地景與生態拼圖',
    clueName: '山景明信片與地質拼圖板',
    stampId: 'stamp_wufengqi',
    stampName: '五峰飛瀑清心印',
    stampIcon: '🏞️',
    description: '認識三層斷崖瀑布構造、五座尖峰由來與富饒芬多精生態。'
  }
};

class StateManager {
  constructor() {
    this.storageKey = 'jiaoxi_treasure_hunt_save_v1';
    this.stamps = new Set();
    this.isChestOpened = false;
    this.listeners = [];
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.stamps = new Set(parsed.stamps || []);
        this.isChestOpened = !!parsed.isChestOpened;
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
      this.stamps = new Set();
      this.isChestOpened = false;
    }
  }

  save() {
    try {
      const data = {
        stamps: Array.from(this.stamps),
        isChestOpened: this.isChestOpened
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  // 訂閱狀態變更
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
    this.save();
  }

  hasStamp(taskId) {
    return this.stamps.has(taskId);
  }

  // 完成任務並授予印章（同一關只計一枚印章）
  awardStamp(taskId) {
    if (!this.stamps.has(taskId) && TASKS_CONFIG[taskId]) {
      this.stamps.add(taskId);
      this.notify();
      return true;
    }
    return false;
  }

  // 開啟文化寶箱
  openChest() {
    if (this.stamps.size >= 5) {
      this.isChestOpened = true;
      this.notify();
      return true;
    }
    return false;
  }

  // 重新遊玩：重置所有進度回到 0 / 5
  resetGame() {
    this.stamps.clear();
    this.isChestOpened = false;
    localStorage.removeItem(this.storageKey);
    this.notify();
  }

  // 取得智慧下一步引導提示
  getNextHint() {
    const total = 5;
    const current = this.stamps.size;

    if (current === 0) {
      return '歡迎來到礁溪！請依導引先前往西側【湯圍溝溫泉公園】調查告示牌，解密美人湯湧泉！';
    }
    if (!this.stamps.has('task_hotspring')) {
      return '請前往西側【湯圍溝溫泉公園】，調查溫泉告示牌探索無色無臭的地下碳酸氫鈉泉！';
    }
    if (!this.stamps.has('task_produce')) {
      return '湯圍溝公園旁有【溫泉農特產菜籃】，快去辨識利用溫泉灌溉的甘甜蔬菜！';
    }
    if (!this.stamps.has('task_xietian_history')) {
      return '請往南邊前往【礁溪協天廟】，研讀廟宇文化卡，認識清嘉慶建廟歷史與武聖關帝！';
    }
    if (!this.stamps.has('task_divination')) {
      return '協天廟正殿設有【聖意籤筒與求筊台】，誠心祈福並體驗民間傳統擲筊！';
    }
    if (!this.stamps.has('task_wufengqi')) {
      return '最後一站！前往東北山林【五峰旗風景區】，拼出壯麗的三層瀑布與五峰奇景！';
    }
    return '太棒了！已集滿全數 5 枚印章！請立即返回中央廣場【旅人任務板】開啟文化寶箱領取徽章！';
  }

  getState() {
    return {
      stampsCount: this.stamps.size,
      totalStamps: 5,
      stamps: Array.from(this.stamps),
      isChestOpened: this.isChestOpened,
      nextHint: this.getNextHint(),
      isCompleted: this.stamps.size >= 5
    };
  }
}

export const gameState = new StateManager();
