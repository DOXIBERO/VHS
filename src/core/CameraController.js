import * as THREE from 'three';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = new THREE.Vector3(0, 0.8, 0);

    // Spherical coordinates for smooth orbit
    this.radius = 8;
    this.theta = 0; // Horizontal angle
    this.phi = Math.PI / 4; // Vertical angle (45 deg)

    this.minPhi = 0.1;
    this.maxPhi = Math.PI / 2 - 0.05;
    this.minRadius = 3;
    this.maxRadius = 20;

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    this.setupEvents();
    this.updatePosition();
  }

  setTarget(targetVector) {
    this.target.copy(targetVector);
  }

  setupEvents() {
    // Mouse events for Desktop
    this.domElement.addEventListener('mousedown', (e) => {
      // Don't drag if clicking UI / touch controls
      if (e.target.closest('#touch-controls')) return;
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.theta -= deltaX * 0.006;
      this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi + deltaY * 0.006));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch events for Mobile (swipe with one finger to rotate camera)
    let touchStartPos = { x: 0, y: 0 };
    let isTouchDragging = false;

    this.domElement.addEventListener('touchstart', (e) => {
      if (e.target.closest('#touch-controls')) return;
      if (e.touches.length === 1) {
        isTouchDragging = true;
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isTouchDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.x;
      const deltaY = touch.clientY - touchStartPos.y;

      this.theta -= deltaX * 0.006;
      this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi + deltaY * 0.006));

      touchStartPos = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isTouchDragging = false;
    });

    // Zoom on wheel
    this.domElement.addEventListener('wheel', (e) => {
      this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius + e.deltaY * 0.01));
    }, { passive: true });
  }

  update(targetPos) {
    if (targetPos) {
      // Smoothly follow player
      this.target.lerp(targetPos, 0.08);
    }
    this.updatePosition();
  }

  updatePosition() {
    // Convert spherical to Cartesian
    const x = this.target.x + this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.target.y + this.radius * Math.cos(this.phi);
    const z = this.target.z + this.radius * Math.sin(this.phi) * Math.cos(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target.x, this.target.y + 0.5, this.target.z);
  }
}
