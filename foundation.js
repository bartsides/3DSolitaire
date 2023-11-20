import * as THREE from "three";

export class Foundation {
  cards = [];
  number;
  position;
  mesh;
  name;

  constructor(number, position, meshPosition, scene, highlightZones) {
    this.number = number;
    this.position = position;

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2.8, 0.01),
      new THREE.MeshBasicMaterial({
        color: highlightZones ? 0xffffff : 0x078c11,
      })
    );
    this.name = `foundation${number}`;
    this.mesh.name = this.name;
    this.mesh.position.set(meshPosition.x, meshPosition.y, meshPosition.z);
    scene.add(this.mesh);
  }

  addCard(card) {
    this.cards.unshift(card);
    if (card.callback) card.callback(card);
    card.callback = this.removeCard;
    this.recalculate();
  }

  recalculate() {
    for (let i = 1; i < this.cards.length; i++) {
      const card = this.cards[i];
      card.move(this.position);
    }
  }

  removeCard(card) {
    this.cards.splice(this.cards.indexOf(card), 1);
    if (this.cards.length && !this.cards[0].up) this.cards[0].flip();
  }
}
