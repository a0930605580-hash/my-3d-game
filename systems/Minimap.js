/**
 * Minimap.js
 * 輕量化雷達小地圖：繪製礁溪小鎮景點相對方位、玩家位置與動態朝向
 */

export class Minimap {
  constructor(player) {
    this.player = player;
    this.canvas = document.getElementById('minimap-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.size = 140;
    this.canvas.width = this.size;
    this.canvas.height = this.size;

    // 地標座標對應表（世界座標 X, Z）
    this.landmarks = [
      { name: '任務板', x: 0, z: 0, icon: '🏠', color: '#f39c12' },
      { name: '湯圍溝', x: -60, z: 20, icon: '♨️', color: '#16a085' },
      { name: '協天廟', x: 10, z: 80, icon: '🏮', color: '#c0392b' },
      { name: '五峰旗', x: 70, z: -70, icon: '🏞️', color: '#27ae60' }
    ];

    // 世界地圖縮放比例（將 ~200 米範圍投影至 140px 小地圖）
    this.scale = 0.55; 
  }

  update() {
    if (!this.ctx || !this.player) return;

    const ctx = this.ctx;
    const center = this.size / 2;

    ctx.clearRect(0, 0, this.size, this.size);

    // 繪製雷達網格與同心圓
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, center / 2, 0, Math.PI * 2);
    ctx.stroke();

    // 十字刻度
    ctx.beginPath();
    ctx.moveTo(center, 0);
    ctx.lineTo(center, this.size);
    ctx.moveTo(0, center);
    ctx.lineTo(this.size, center);
    ctx.stroke();

    // 繪製地標
    this.landmarks.forEach(lm => {
      // 相對於世界中心的投影位置
      const px = center + lm.x * this.scale;
      const py = center + lm.z * this.scale;

      // 邊界限制在圓內
      const dx = px - center;
      const dy = py - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = center - 12;

      let drawX = px;
      let drawY = py;
      if (dist > maxDist) {
        drawX = center + (dx / dist) * maxDist;
        drawY = center + (dy / dist) * maxDist;
      }

      ctx.fillStyle = lm.color;
      ctx.beginPath();
      ctx.arc(drawX, drawY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(lm.icon, drawX, drawY - 6);
    });

    // 繪製玩家位置與視角朝向箭頭
    const pPos = this.player.getPosition();
    const pX = center + pPos.x * this.scale;
    const pY = center + pPos.z * this.scale;
    const rotation = this.player.getRotationY();

    ctx.save();
    ctx.translate(pX, pY);
    ctx.rotate(-rotation);

    // 玩家本體光點
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 視野方向視錐
    ctx.fillStyle = 'rgba(255, 71, 87, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, -12);
    ctx.lineTo(6, -12);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
