import * as THREE from "three";
import { Faces } from "./faces";

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

  addCard(card, source) {
    if (!this.suit) this.suit = card.suit;

    this.cards.unshift(card);
    if (source) source.removeCard(card);
    this.recalculate();
  }

  isValidPlay(card) {
    if (!this.suit && card.face === Faces[0]) return true;
    return this.suit === card.suit && card.rank - this.cards[0].rank === 1;
  }

  recalculate() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      if (i === 0) {
        card.move({
          x: this.position.x,
          y: this.position.y,
          z: this.position.z + 0.01,
        });
      } else {
        card.move(this.position);
      }
    }
  }

  removeCard(card) {
    this.cards.splice(this.cards.indexOf(card), 1);
    if (this.cards.length && !this.cards[0].up) this.cards[0].flip();
  }
}
