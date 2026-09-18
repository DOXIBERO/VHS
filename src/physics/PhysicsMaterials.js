import * as CANNON from 'cannon-es';

export class PhysicsMaterials {
  constructor() {
    // 5 Materials as per Part 0091-0100
    this.BEAN = new CANNON.Material('bean');
    this.GROUND = new CANNON.Material('ground');
    this.ICE = new CANNON.Material('ice');
    this.SLIME = new CANNON.Material('slime');
    this.RUBBER = new CANNON.Material('rubber');

    this.contactMaterials = [];
    this.initContactMaterials();
  }

  initContactMaterials() {
    // BEAN <-> GROUND
    this.contactMaterials.push(
      new CANNON.ContactMaterial(this.BEAN, this.GROUND, {
        friction: 0.4,
        restitution: 0.5
      })
    );

    // BEAN <-> ICE (Friction < 0.05)
    this.contactMaterials.push(
      new CANNON.ContactMaterial(this.BEAN, this.ICE, {
        friction: 0.02,
        restitution: 0.3
      })
    );

    // BEAN <-> SLIME (Heavy, no bounce)
    this.contactMaterials.push(
      new CANNON.ContactMaterial(this.BEAN, this.SLIME, {
        friction: 0.9,
        restitution: 0.0
      })
    );

    // BEAN <-> RUBBER (Restitution > 0.8)
    this.contactMaterials.push(
      new CANNON.ContactMaterial(this.BEAN, this.RUBBER, {
        friction: 0.8,
        restitution: 0.9
      })
    );

    // BEAN <-> BEAN (Bouncy crowd collisions)
    this.contactMaterials.push(
      new CANNON.ContactMaterial(this.BEAN, this.BEAN, {
        friction: 0.3,
        restitution: 0.6
      })
    );
  }

  registerAll(world) {
    this.contactMaterials.forEach(cm => world.addContactMaterial(cm));
  }
}
