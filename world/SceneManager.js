/**
 * SceneManager.js
 * 3D 基礎場景、燈光、動態天空、街道地貌與蘭陽山林環境
 */

import * as THREE from 'three';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb5d5ee);
    this.scene.fog = new THREE.FogExp2(0xb5d5ee, 0.0055);

    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 15, 25);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    this.initLights();
    this.buildTerrain();
    this.buildEnvironment();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLights() {
    // 環境光
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.7);
    this.scene.add(ambientLight);

    // 半球光（天藍與草綠地面反彈）
    const hemiLight = new THREE.HemisphereLight(0x70b5ff, 0x5a8850, 0.6);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // 主太陽光
    const sunLight = new THREE.DirectionalLight(0xfff3cc, 1.4);
    sunLight.position.set(60, 90, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 250;
    const d = 120;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);
    this.sunLight = sunLight;
  }

  buildTerrain() {
    // 綠意平原大地
    const groundGeo = new THREE.PlaneGeometry(350, 350, 40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x6ab04c,
      roughness: 0.9,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 中央迎賓廣場鋪石基底
    const plazaGeo = new THREE.CircleGeometry(22, 32);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xdcdde1,
      roughness: 0.8
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.03, 0);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // 放射道路系統（連接中央廣場與三大景點）
    this.createRoad(new THREE.Vector3(0, 0.04, 0), new THREE.Vector3(-60, 0.04, 20), 5); // 往湯圍溝
    this.createRoad(new THREE.Vector3(0, 0.04, 0), new THREE.Vector3(10, 0.04, 80), 5);  // 往協天廟
    this.createRoad(new THREE.Vector3(0, 0.04, 0), new THREE.Vector3(70, 0.04, -70), 5); // 往五峰旗

    // 蜿蜒溪流（從五峰旗山巒流向平原）
    this.createRiver();
  }

  createRoad(start, end, width) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const roadGeo = new THREE.PlaneGeometry(width, length);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x95a5a6,
      roughness: 0.85
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.copy(mid);
    road.rotation.z = Math.atan2(end.x - start.x, end.z - start.z);
    road.receiveShadow = true;
    this.scene.add(road);
  }

  createRiver() {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(80, 0.02, -80),
      new THREE.Vector3(50, 0.02, -50),
      new THREE.Vector3(25, 0.02, -20),
      new THREE.Vector3(-20, 0.02, 0),
      new THREE.Vector3(-65, 0.02, 25),
      new THREE.Vector3(-100, 0.02, 40)
    ]);

    const riverGeo = new THREE.TubeGeometry(curve, 32, 3.5, 8, false);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x2980b9,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.scale.set(1, 0.05, 1);
    this.scene.add(river);
  }

  buildEnvironment() {
    // 雪山山脈遠景群山
    this.createMountains();

    // 隨機樹木與街燈
    this.populateTrees();
  }

  createMountains() {
    const mountainGroup = new THREE.Group();
    const mtnMat = new THREE.MeshStandardMaterial({
      color: 0x3d6b38,
      roughness: 0.95
    });

    const mtnConfigs = [
      { x: -120, z: -100, r: 60, h: 55 },
      { x: -50, z: -130, r: 70, h: 70 },
      { x: 30, z: -140, r: 80, h: 80 },
      { x: 100, z: -120, r: 75, h: 85 },
      { x: 140, z: -60, r: 65, h: 60 }
    ];

    mtnConfigs.forEach(cfg => {
      const geo = new THREE.ConeGeometry(cfg.r, cfg.h, 7);
      const mesh = new THREE.Mesh(geo, mtnMat);
      mesh.position.set(cfg.x, cfg.h / 2, cfg.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mountainGroup.add(mesh);
    });

    this.scene.add(mountainGroup);
  }

  populateTrees() {
    const treeGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.8 });

    const treePositions = [];
    // 散佈在非核心景點空地
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 25 + Math.random() * 110;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // 避開主要地標中心
      if (Math.hypot(x, z) < 18) continue;
      if (Math.hypot(x - (-60), z - 20) < 20) continue;
      if (Math.hypot(x - 10, z - 80) < 22) continue;
      if (Math.hypot(x - 70, z - (-70)) < 25) continue;

      treePositions.push({ x, z, scale: 0.8 + Math.random() * 0.5 });
    }

    treePositions.forEach(p => {
      const tree = new THREE.Group();
      // 樹幹
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 2.5, 6), trunkMat);
      trunk.position.y = 1.25;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // 樹冠
      const folMat = Math.random() > 0.5 ? foliageMat1 : foliageMat2;
      const fol = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4, 7), folMat);
      fol.position.y = 3.8;
      fol.castShadow = true;
      tree.add(fol);

      tree.position.set(p.x, 0, p.z);
      tree.scale.setScalar(p.scale);
      treeGroup.add(tree);
    });

    this.scene.add(treeGroup);
  }

  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
