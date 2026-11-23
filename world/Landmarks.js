/**
 * Landmarks.js
 * 礁溪三大核心地標與迎賓任務板 3D 景觀模型：
 * 1. 迎賓任務板與文化寶箱 (0, 0)
 * 2. 湯圍溝溫泉公園 (-60, 20)：木造泡腳亭、溫泉水道、蒸氣粒子
 * 3. 礁溪協天廟 (10, 80)：閩南燕尾脊屋頂、朱紅大柱、牌樓、大天公爐
 * 4. 五峰旗風景區 (70, -70)：五座尖峰、三層落差岩壁瀑布、觀瀑亭
 */

import * as THREE from 'three';

export class LandmarksManager {
  constructor(scene) {
    this.scene = scene;
    this.steamParticles = [];
    this.waterfallParticles = [];
    this.treasureChest = null;

    this.buildTravelerBoardAndChest();
    this.buildTangweigouPark();
    this.buildXietianTemple();
    this.buildWufengqiScenic();
  }

  // 輔助函式：建立懸浮 3D 中文立牌文字
  createFloatingLabel(text, y = 8, color = '#2c3e50', bgColor = 'rgba(255, 255, 255, 0.95)', borderColor = '#d4af37') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // 圓角背景與金邊
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 96, 24);
    ctx.fill();
    ctx.stroke();

    // 中文字體
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(10, 2.5, 1);
    sprite.position.y = y;
    return sprite;
  }

  // ================= 1. 迎賓廣場、任務板與文化寶箱 =================
  buildTravelerBoardAndChest() {
    const group = new THREE.Group();
    group.position.set(0, 0, 0);

    // 迎賓告示任務板
    const boardGroup = new THREE.Group();
    boardGroup.position.set(0, 0, -4);

    // 兩側木樁
    const postMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
    const postGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.5);
    const postL = new THREE.Mesh(postGeo, postMat);
    postL.position.set(-2.5, 2.25, 0);
    const postR = new THREE.Mesh(postGeo, postMat);
    postR.position.set(2.5, 2.25, 0);
    boardGroup.add(postL, postR);

    // 主展示板
    const panelGeo = new THREE.BoxGeometry(5.2, 2.8, 0.2);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.6 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 2.8, 0);
    boardGroup.add(panel);

    // 任務板上方木造遮雨簷
    const roofGeo = new THREE.ConeGeometry(3.8, 0.8, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc0392b });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 4.4, 0);
    roof.rotation.y = Math.PI / 4;
    boardGroup.add(roof);

    // 任務板地標標籤
    const boardLabel = this.createFloatingLabel('📌 旅人任務板 ＆ 寶箱', 6.2, '#962d22', 'rgba(255,255,255,0.95)');
    boardGroup.add(boardLabel);

    group.add(boardGroup);

    // 文化寶箱（置於中央石台基座上）
    const chestGroup = new THREE.Group();
    chestGroup.position.set(0, 0, 2.5);

    // 石造底座
    const pedGeo = new THREE.CylinderGeometry(2, 2.2, 0.6, 16);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, roughness: 0.9 });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = 0.3;
    pedestal.receiveShadow = true;
    chestGroup.add(pedestal);

    // 寶箱主體下半部
    const baseGeo = new THREE.BoxGeometry(2, 1, 1.3);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8e44ad, roughness: 0.6, metalness: 0.1 });
    const chestBase = new THREE.Mesh(baseGeo, woodMat);
    chestBase.position.y = 1.1;
    chestBase.castShadow = true;
    chestGroup.add(chestBase);

    // 寶箱金色包邊
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
    const bandGeo = new THREE.BoxGeometry(2.05, 0.15, 1.35);
    const band = new THREE.Mesh(bandGeo, goldMat);
    band.position.y = 1.1;
    chestGroup.add(band);

    // 寶箱蓋子（鉸鏈動畫）
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 1.6, -0.65); // 鉸鏈位於後緣

    const lidMeshGeo = new THREE.CylinderGeometry(0.65, 0.65, 2, 16, 1, false, 0, Math.PI);
    const lidMesh = new THREE.Mesh(lidMeshGeo, woodMat);
    lidMesh.rotation.z = Math.PI / 2;
    lidMesh.position.set(0, 0, 0.65);
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    // 鎖頭
    const lockGeo = new THREE.BoxGeometry(0.3, 0.4, 0.15);
    const lock = new THREE.Mesh(lockGeo, goldMat);
    lock.position.set(0, -0.1, 1.35);
    lidGroup.add(lock);

    chestGroup.add(lidGroup);

    // 儲存動畫觸發器
    chestGroup.userData = {
      isChest: true,
      openAnim: () => {
        let angle = 0;
        const interval = setInterval(() => {
          angle += 0.08;
          lidGroup.rotation.x = -angle;
          if (angle >= 1.4) clearInterval(interval);
        }, 16);
      }
    };

    // 寶箱光芒圓環
    const auraGeo = new THREE.RingGeometry(1.6, 2.0, 32);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.62;
    chestGroup.add(aura);

    group.add(chestGroup);
    this.treasureChest = chestGroup;

    this.scene.add(group);
  }

  // ================= 2. 湯圍溝溫泉公園 =================
  buildTangweigouPark() {
    const group = new THREE.Group();
    group.position.set(-60, 0, 20);

    // 公園入口石碑
    const stoneGeo = new THREE.BoxGeometry(1.8, 3.2, 0.8);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.95 });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.set(10, 1.6, 0);
    stone.castShadow = true;
    group.add(stone);

    // 檜木泡腳亭主體
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.7 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.85 });

    // 四支木柱
    const pillarGeo = new THREE.CylinderGeometry(0.25, 0.25, 4.5, 8);
    [
      [-5, -4], [5, -4], [-5, 4], [5, 4]
    ].forEach(([x, z]) => {
      const p = new THREE.Mesh(pillarGeo, woodMat);
      p.position.set(x, 2.25, z);
      p.castShadow = true;
      group.add(p);
    });

    // 泡腳亭四角瓦屋頂
    const roofGeo = new THREE.ConeGeometry(8.5, 2.5, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 5.6, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // 溫泉足湯水池（下凹石砌水池）
    const poolRimGeo = new THREE.BoxGeometry(7, 0.6, 5);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.9 });
    const rim = new THREE.Mesh(poolRimGeo, rimMat);
    rim.position.set(0, 0.3, 0);
    rim.receiveShadow = true;
    group.add(rim);

    // 澄澈溫泉水面
    const waterGeo = new THREE.PlaneGeometry(6, 4);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1abc9c,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.55, 0);
    group.add(water);

    // 日式石燈籠
    [-7, 7].forEach(x => {
      const lanternGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 6);
      const lanternMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, roughness: 0.9 });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(x, 1, 6);
      group.add(lantern);
    });

    // 溫泉白煙蒸氣粒子系統
    const steamGroup = new THREE.Group();
    const particleGeo = new THREE.SphereGeometry(0.25, 6, 6);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });

    for (let i = 0; i < 28; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat.clone());
      p.position.set(
        (Math.random() - 0.5) * 5,
        0.6 + Math.random() * 3.5,
        (Math.random() - 0.5) * 3
      );
      p.userData = {
        speedY: 0.015 + Math.random() * 0.02,
        initialY: 0.6,
        maxY: 4.2
      };
      steamGroup.add(p);
      this.steamParticles.push(p);
    }
    group.add(steamGroup);

    // 3D 浮空地標標籤
    const label = this.createFloatingLabel('♨️ 湯圍溝溫泉公園', 8.2, '#16a085', 'rgba(255, 255, 255, 0.95)');
    group.add(label);

    this.scene.add(group);
  }

  // ================= 3. 礁溪協天廟 =================
  buildXietianTemple() {
    const group = new THREE.Group();
    group.position.set(10, 0, 80);

    // 協天廟大牌樓（入口處）
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -14);

    const archPillarGeo = new THREE.CylinderGeometry(0.4, 0.45, 6, 8);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.4, metalness: 0.7 });

    const archL = new THREE.Mesh(archPillarGeo, redMat);
    archL.position.set(-4, 3, 0);
    const archR = new THREE.Mesh(archPillarGeo, redMat);
    archR.position.set(4, 3, 0);
    archGroup.add(archL, archR);

    // 牌樓橫樑
    const beamGeo = new THREE.BoxGeometry(9.5, 0.8, 0.8);
    const beam = new THREE.Mesh(beamGeo, redMat);
    beam.position.set(0, 5.8, 0);
    archGroup.add(beam);

    // 牌樓屋頂
    const archRoofGeo = new THREE.ConeGeometry(6.5, 1.6, 4);
    const goldRoofMat = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.5 });
    const archRoof = new THREE.Mesh(archRoofGeo, goldRoofMat);
    archRoof.position.set(0, 7.2, 0);
    archRoof.rotation.y = Math.PI / 4;
    archGroup.add(archRoof);

    group.add(archGroup);

    // 協天廟正殿大木作主體建築
    const templeBodyGeo = new THREE.BoxGeometry(14, 6, 10);
    const templeWallMat = new THREE.MeshStandardMaterial({ color: 0xd98880, roughness: 0.8 });
    const templeBody = new THREE.Mesh(templeBodyGeo, templeWallMat);
    templeBody.position.set(0, 3, 2);
    templeBody.castShadow = true;
    group.add(templeBody);

    // 正殿八根朱紅圓柱
    for (let x = -6; x <= 6; x += 4) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6.2, 8), redMat);
      p.position.set(x, 3.1, -3.2);
      p.castShadow = true;
      group.add(p);
    }

    // 經典燕尾脊屋頂（閩南宮廟特色雙翹尾）
    const roofMainGeo = new THREE.ConeGeometry(11, 3.2, 4);
    const roofMain = new THREE.Mesh(roofMainGeo, goldRoofMat);
    roofMain.position.set(0, 7.5, 2);
    roofMain.rotation.y = Math.PI / 4;
    roofMain.scale.set(1.4, 1, 0.9);
    roofMain.castShadow = true;
    group.add(roofMain);

    // 屋頂兩端飛翹的燕尾尖端
    [-8, 8].forEach(x => {
      const tipGeo = new THREE.ConeGeometry(0.3, 1.8, 4);
      const tip = new THREE.Mesh(tipGeo, goldMat);
      tip.position.set(x, 9.4, 2);
      tip.rotation.z = x > 0 ? -Math.PI / 3 : Math.PI / 3;
      group.add(tip);
    });

    // 廟埕大天公爐（巨大銅製香爐）
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(0, 0, -6);

    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x4a3c31, metalness: 0.8, roughness: 0.4 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 1.4, 12), bronzeMat);
    pot.position.y = 1.3;
    pot.castShadow = true;
    burnerGroup.add(pot);

    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.7), bronzeMat);
    leg1.position.set(-0.7, 0.35, 0);
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.7), bronzeMat);
    leg2.position.set(0.7, 0.35, 0);
    burnerGroup.add(leg1, leg2);

    group.add(burnerGroup);

    // 3D 浮空地標標籤
    const label = this.createFloatingLabel('🏮 礁溪協天廟', 11.5, '#c0392b', 'rgba(255, 255, 255, 0.95)');
    group.add(label);

    this.scene.add(group);
  }

  // ================= 4. 五峰旗風景區 =================
  buildWufengqiScenic() {
    const group = new THREE.Group();
    group.position.set(70, 0, -70);

    // 後方五座高聳尖銳山峰（五峰旗地名由來）
    const peakConfigs = [
      { x: -16, z: -10, h: 36, r: 8 },
      { x: -8, z: -14, h: 44, r: 9 },
      { x: 0, z: -16, h: 50, r: 10 }, // 最高主峰
      { x: 8, z: -14, h: 42, r: 9 },
      { x: 16, z: -10, h: 35, r: 8 }
    ];

    const rockMat = new THREE.MeshStandardMaterial({ color: 0x4b6584, roughness: 0.9 });

    peakConfigs.forEach(cfg => {
      const peakGeo = new THREE.ConeGeometry(cfg.r, cfg.h, 6);
      const peak = new THREE.Mesh(peakGeo, rockMat);
      peak.position.set(cfg.x, cfg.h / 2, cfg.z);
      peak.castShadow = true;
      group.add(peak);
    });

    // 斷崖峭壁瀑布岩石構造（三層落差）
    const cliffGeo = new THREE.BoxGeometry(18, 22, 10);
    const cliff = new THREE.Mesh(cliffGeo, rockMat);
    cliff.position.set(0, 11, -2);
    cliff.castShadow = true;
    cliff.receiveShadow = true;
    group.add(cliff);

    // 瀑布急流水道（垂直傾瀉水簾）
    const fallsGeo = new THREE.PlaneGeometry(3.5, 20);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0xe0f7fa,
      roughness: 0.05,
      metalness: 0.4,
      transparent: true,
      opacity: 0.9
    });
    const falls = new THREE.Mesh(fallsGeo, waterMat);
    falls.position.set(0, 11, 3.1);
    group.add(falls);

    // 瀑布激起的水霧與飛濺粒子
    const mistGeo = new THREE.SphereGeometry(0.3, 6, 6);
    const mistMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 35; i++) {
      const m = new THREE.Mesh(mistGeo, mistMat.clone());
      m.position.set(
        (Math.random() - 0.5) * 4,
        Math.random() * 18,
        3.2 + Math.random() * 2
      );
      m.userData = {
        speedY: 0.08 + Math.random() * 0.08,
        startY: 20,
        bottomY: 0.5
      };
      group.add(m);
      this.waterfallParticles.push(m);
    }

    // 木造觀瀑亭「五峰亭」
    const pavilionGroup = new THREE.Group();
    pavilionGroup.position.set(12, 0, 5);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b572a, roughness: 0.8 });
    for (let px = -2; px <= 2; px += 4) {
      for (let pz = -2; pz <= 2; pz += 4) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.5), woodMat);
        pillar.position.set(px, 1.75, pz);
        pavilionGroup.add(pillar);
      }
    }
    const pavRoof = new THREE.Mesh(new THREE.ConeGeometry(4, 1.8, 6), woodMat);
    pavRoof.position.y = 4.2;
    pavilionGroup.add(pavRoof);
    group.add(pavilionGroup);

    // 3D 浮空地標標籤
    const label = this.createFloatingLabel('🏞️ 五峰旗風景區', 14.5, '#27ae60', 'rgba(255, 255, 255, 0.95)');
    group.add(label);

    this.scene.add(group);
  }

  // 每幀動態更新粒子（溫泉蒸汽與瀑布流水）
  update(delta) {
    // 溫泉白煙緩緩上升
    this.steamParticles.forEach(p => {
      p.position.y += p.userData.speedY;
      p.scale.addScalar(0.003);
      if (p.position.y > p.userData.maxY) {
        p.position.y = p.userData.initialY;
        p.scale.set(1, 1, 1);
      }
    });

    // 瀑布水滴奔騰下瀉
    this.waterfallParticles.forEach(m => {
      m.position.y -= m.userData.speedY;
      if (m.position.y < m.userData.bottomY) {
        m.position.y = m.userData.startY;
      }
    });
  }
}
