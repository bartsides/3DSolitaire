import * as THREE from "three";

export class Column {
  name;
  number;
  position;
  mesh;
  cards = [];

  constructor(number, position, meshPosition, scene, highlightZones) {
    this.number = number;
    this.position = position;

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 10, 0.01),
      new THREE.MeshBasicMaterial({
        color: highlightZones ? 0xffffff : 0x078c11,
      })
    );
    this.name = `column${number}`;
    this.mesh.name = this.name;
    this.mesh.position.set(meshPosition.x, meshPosition.y, meshPosition.z);
    scene.add(this.mesh);
  }

  isValidPlay(card) {
    if (!this.cards?.length) return card.face === "King";
    const topCard = this.cards[0];
    return topCard.red !== card.red && topCard.rank - card.rank === 1;
  }

  addCard(card) {
    this.cards.unshift(card);
    this.recalculate();
  }

  removeCard(card) {
    this.cards.splice(this.cards.indexOf(card), 1);
    if (this.cards.length && !this.cards[0].up) this.cards[0].flip();
    this.recalculate();
  }

  recalculate() {
    if (!this.cards?.length) return;

    let ySpacer = 0.5;
    let zSpacer = 0.01;
    for (let i = 0; i < this.cards.length; i++) {
      const pos = {
        x: this.position.x,
        y: this.position.y + ySpacer * (this.cards.length - i),
        z: this.position.z + zSpacer * (this.cards.length - i),
      };
      this.cards[i].move(pos, this.name);
    }
  }

  tick(delta) {
    this.cards.forEach((c) => c.tick(delta));
  }
}
