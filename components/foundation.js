import * as THREE from "three";
import { Faces } from "../config/faces";

export class Foundation {
  cards = [];
  number;
  position;
  mesh;
  name;
  suit;

  constructor(number, position, meshPosition, scene, highlightZones) {
    this.number = number;
    this.position = position;

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 3, 0.01),
      new THREE.MeshBasicMaterial({
        color: highlightZones ? 0xffffff : 0x078c11,
      })
    );
    this.name = `foundation${number}`;
    this.mesh.name = this.name;
    this.mesh.position.set(meshPosition.x, meshPosition.y, meshPosition.z);
    scene.add(this.mesh);
  }

  isValidPlay(card) {
    if (!this.suit && card.face === Faces[0]) return true;
    return this.suit === card.suit && card.rank - this.cards[0].rank === 1;
  }

  addCard(card) {
    if (!this.suit) this.suit = card.suit;
    this.cards.unshift(card);
    this.recalculate();
  }

  removeCard(card) {
    this.cards.splice(this.cards.indexOf(card), 1);
    this.recalculate();
  }

  recalculate() {
    if (!this.cards?.length) return;

    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const pos =
        i === 0
          ? {
              x: this.position.x,
              y: this.position.y,
              z: this.position.z + 0.01,
            }
          : this.position;

      card.move(pos, this.name);
    }
  }

  tick(delta) {
    this.cards.forEach((c) => c.tick(delta));
  }
}
