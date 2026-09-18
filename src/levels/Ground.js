import * as THREE from 'three';

export class Ground {
  constructor(scene) {
    this.scene = scene;
    this.geometry = new THREE.PlaneGeometry(100, 100);
    this.material = new THREE.MeshStandardMaterial({
      color: 0x4a7c59, // Grass green
      roughness: 0.8,
      metalness: 0.1
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2; // -90 deg on X axis
    this.mesh.position.set(0, 0, 0);
    this.mesh.receiveShadow = true;
    this.mesh.name = 'Ground';

    this.scene.add(this.mesh);
  }
}
