/**
 * AudioManager.js
 * 純 Web Audio API 程序化音效引擎，無須外部音效檔，保證 100% 穩定且隨開即聽
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.masterGain = null;
    this.ambientOsc = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.isMuted;
  }

  // 腳步聲
  playFootstep() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // 發現線索聲（豎琴泛音琶音）
  playDiscover() {
    if (this.isMuted) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  // 答對 / 成功提示
  playCorrect() {
    if (this.isMuted) return;
    this.init();
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    chords.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  }

  // 答錯提示
  playWrong() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.25);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // 蓋印章聲（重音撞擊 + 鈴鐺金屬餘音）
  playStamp() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    // 鈍擊低音
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(160, t);
    thud.frequency.exponentialRampToValueAtTime(35, t + 0.12);
    thudGain.gain.setValueAtTime(0.45, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(t);
    thud.stop(t + 0.15);

    // 金屬鈴聲
    const bell = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(1318.5, t + 0.05); // E6
    bellGain.gain.setValueAtTime(0.25, t + 0.05);
    bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    bell.connect(bellGain);
    bellGain.connect(this.masterGain);
    bell.start(t + 0.05);
    bell.stop(t + 0.65);
  }

  // 擲筊撞擊聲
  playJiaobei() {
    if (this.isMuted) return;
    this.init();
    [0, 0.1, 0.18].forEach((delay, i) => {
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320 - i * 40, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);

      gain.gain.setValueAtTime(0.25 / (i + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  // 開啟文化寶箱通關交響信號（壯闊號角三和弦）
  playChestFanfare() {
    if (this.isMuted) return;
    this.init();
    const notes = [
      { f: 523.25, d: 0.18, start: 0.0 }, // C5
      { f: 659.25, d: 0.18, start: 0.18 }, // E5
      { f: 783.99, d: 0.18, start: 0.36 }, // G5
      { f: 1046.5, d: 0.6, start: 0.54 }  // C6
    ];

    notes.forEach(n => {
      const t = this.ctx.currentTime + n.start;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + n.d + 0.05);
    });
  }
}

export const audioManager = new SoundEngine();
