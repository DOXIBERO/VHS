import * as CANNON from 'cannon-es';
import { PhysicsMaterials } from './PhysicsMaterials.js';

export class PhysicsWorld {
  constructor() {
    // 1. Initialize Cannon-es World with gravity (0, -9.82, 0) (Part 0083-0090)
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });

    // 2. Materials & Contact Properties (Part 0091-0100)
    this.materials = new PhysicsMaterials();
    this.materials.registerAll(this.world);

    // 3. Body-Mesh sync mapping
    this.syncPairs = [];

    // 4. Physics Ground Plane matching visual ground (Part 0083-0090)
    this.initGroundPlane();
  }

  initGroundPlane() {
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: this.materials.GROUND
    });
    // Rotate -90° on X axis to face upward (+Y)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.position.set(0, 0, 0);
    this.world.addBody(groundBody);
    this.groundBody = groundBody;
  }

  addBody(body, mesh = null) {
    this.world.addBody(body);
    if (mesh) {
      this.syncPairs.push({ body, mesh });
    }
  }

  removeBody(body) {
    this.world.removeBody(body);
    this.syncPairs = this.syncPairs.filter(pair => pair.body !== body);
  }

  step(dt) {
    // Fixed timestep step (60fps)
    this.world.step(1 / 60, dt, 3);

    // Sync Three.js mesh positions & rotations with Cannon.js physics bodies
    for (let i = 0; i < this.syncPairs.length; i++) {
      const { body, mesh } = this.syncPairs[i];
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    }
  }
}
