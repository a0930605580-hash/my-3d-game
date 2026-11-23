/**
 * Player.js
 * 旅人角色控制器：3D 角色外觀、平滑第三人稱跟隨視角、鍵盤/觸控移動與鏡頭旋轉縮放
 */

import * as THREE from 'three';
import { audioManager } from '../systems/AudioManager.js';

export class Player {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    // 移動與物理參數
    this.speed = 12.0;
    this.velocity = new THREE.Vector3();
    this.position = new THREE.Vector3(0, 0, 5); // 起始位置：中央迎賓廣場
    this.rotationY = 0;

    // 鏡頭軌道控制參數
    this.cameraDistance = 14;
    this.cameraPitch = 0.45; // 仰角
    this.cameraYaw = 0;     // 方位角
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    // 輸入按鍵狀態
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    // 觸控虛擬搖桿方向
    this.joystickVector = { x: 0, y: 0 };

    // 步頻計時器
    this.stepTimer = 0;
    this.isMoving = false;

    this.createAvatarMesh();
    this.initControls();
  }

  createAvatarMesh() {
    this.mesh = new THREE.Group();

    // 身體軀幹（旅人背心風衣）
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.7 });
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.45, 1.1, 8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.05;
    body.castShadow = true;
    this.mesh.add(body);

    // 頭部
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.5 });
    const headGeo = new THREE.SphereGeometry(0.32, 12, 12);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.85;
    head.castShadow = true;
    this.mesh.add(head);

    // 遮陽圓草帽（文化探索旅人標誌）
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.9 });
    const hatBrimGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.05, 16);
    const hatBrim = new THREE.Mesh(hatBrimGeo, hatMat);
    hatBrim.position.y = 2.05;
    const hatTopGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.35, 12);
    const hatTop = new THREE.Mesh(hatTopGeo, hatMat);
    hatTop.position.y = 2.22;
    this.mesh.add(hatBrim, hatTop);

    // 後背包（裝著尋寶護照）
    const packMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.8 });
    const packGeo = new THREE.BoxGeometry(0.5, 0.7, 0.35);
    const backpack = new THREE.Mesh(packGeo, packMat);
    backpack.position.set(0, 1.15, -0.4);
    backpack.castShadow = true;
    this.mesh.add(backpack);

    // 腳步陰影
    const shadowGeo = new THREE.CircleGeometry(0.55, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.mesh.add(shadow);

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  initControls() {
    // 鍵盤移動監聽
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // 滑鼠鏡頭旋轉與縮放
    this.domElement.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.cameraYaw -= deltaX * 0.005;
      this.cameraPitch = Math.max(0.1, Math.min(Math.PI / 2.3, this.cameraPitch + deltaY * 0.005));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // 滾輪縮放鏡頭
    this.domElement.addEventListener('wheel', (e) => {
      this.cameraDistance = Math.max(6, Math.min(30, this.cameraDistance + e.deltaY * 0.015));
    }, { passive: true });

    // 虛擬搖桿（觸控裝置）
    this.initTouchJoystick();
  }

  initTouchJoystick() {
    const zone = document.getElementById('virtual-joystick-zone');
    const knob = document.getElementById('virtual-joystick-knob');
    if (!zone || !knob) return;

    let touchId = null;
    const center = { x: 60, y: 60 };

    zone.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const rect = zone.getBoundingClientRect();
          const touchX = touch.clientX - rect.left;
          const touchY = touch.clientY - rect.top;

          const dx = touchX - center.x;
          const dy = touchY - center.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 38;

          const angle = Math.atan2(dy, dx);
          const limitedDist = Math.min(dist, maxDist);

          const knobX = center.x + Math.cos(angle) * limitedDist - 25;
          const knobY = center.y + Math.sin(angle) * limitedDist - 25;
          knob.style.transform = `translate(${knobX - 35}px, ${knobY - 35}px)`;

          this.joystickVector = {
            x: (Math.cos(angle) * limitedDist) / maxDist,
            y: (Math.sin(angle) * limitedDist) / maxDist
          };
          e.preventDefault();
        }
      }
    }, { passive: false });

    const resetKnob = () => {
      touchId = null;
      knob.style.transform = 'translate(0px, 0px)';
      this.joystickVector = { x: 0, y: 0 };
    };

    zone.addEventListener('touchend', resetKnob);
    zone.addEventListener('touchcancel', resetKnob);
  }

  onKeyDown(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
      case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
      case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
      case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
      case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
    }
  }

  teleportTo(x, z) {
    this.position.set(x, 0, z);
    this.mesh.position.copy(this.position);
    this.updateCamera(0.016);
  }

  update(delta) {
    // 依相機角度計算移動向量
    let moveX = 0;
    let moveZ = 0;

    if (this.keys.forward) moveZ -= 1;
    if (this.keys.backward) moveZ += 1;
    if (this.keys.left) moveX -= 1;
    if (this.keys.right) moveX += 1;

    // 加入觸控搖桿量
    if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
      moveX += this.joystickVector.x;
      moveZ += this.joystickVector.y;
    }

    const inputLen = Math.hypot(moveX, moveZ);
    this.isMoving = inputLen > 0.05;

    if (this.isMoving) {
      // 沿鏡頭 Yaw 旋轉移動向量
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, -moveZ / inputLen)
        .addScaledVector(right, moveX / inputLen)
        .normalize();

      this.position.addScaledVector(moveDir, this.speed * delta);

      // 地圖邊界防穿出
      this.position.x = Math.max(-120, Math.min(120, this.position.x));
      this.position.z = Math.max(-120, Math.min(120, this.position.z));

      // 角色朝向轉向移動方向
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      this.rotationY = targetRotation;
      this.mesh.rotation.y = targetRotation;

      // 行走微幅上下律動
      this.stepTimer += delta * 12;
      this.mesh.position.y = Math.sin(this.stepTimer) * 0.08;

      // 腳步音效
      if (Math.sin(this.stepTimer) > 0.95) {
        audioManager.playFootstep();
      }
    } else {
      this.mesh.position.y = 0;
    }

    this.mesh.position.x = this.position.x;
    this.mesh.position.z = this.position.z;

    this.updateCamera(delta);
  }

  updateCamera(delta) {
    // 依球坐標平滑計算相機相對位置
    const offset = new THREE.Vector3(
      this.cameraDistance * Math.sin(this.cameraPitch) * Math.sin(this.cameraYaw),
      this.cameraDistance * Math.cos(this.cameraPitch),
      this.cameraDistance * Math.sin(this.cameraPitch) * Math.cos(this.cameraYaw)
    );

    const targetPos = this.position.clone().add(offset);
    this.camera.position.lerp(targetPos, 0.15);

    const lookTarget = this.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    this.camera.lookAt(lookTarget);
  }

  getPosition() {
    return this.position;
  }

  getRotationY() {
    return this.rotationY;
  }
}
