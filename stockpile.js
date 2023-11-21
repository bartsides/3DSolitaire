import * as THREE from "three";

export class Stockpile {
  deck;
  position;
  mesh;
  wasteMesh;
  waste = [];

  constructor(position, meshPosition, scene, highlightZones) {
    this.position = position;

    const color = highlightZones ? 0xffffff : 0x078c11;
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 3, 0.01),
      new THREE.MeshBasicMaterial({ color: color })
    );
    this.mesh.name = "stockpile";
    this.mesh.position.set(meshPosition.x, meshPosition.y, meshPosition.z);
    scene.add(this.mesh);

    this.wasteMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 3, 0.01),
      new THREE.MeshBasicMaterial({ color: color })
    );
    this.wasteMesh.name = "waste";
    this.wasteMesh.position.set(
      meshPosition.x - 3.55,
      meshPosition.y,
      meshPosition.z
    );
    scene.add(this.wasteMesh);
  }

  drawCards() {
    this.waste.forEach((card) => {
      this.deck.cards.push(card);
      card.move(this.position);
      card.flip();
    });
    this.waste = [];

    for (let i = 0; i < Math.min(3, this.deck.cards.length); i++) {
      const card = this.drawCard();
      card.flip();
      this.waste.push(card);
    }

    this.recalculate();
  }

  drawCard() {
    return this.deck.cards.shift();
  }

  recalculate() {
    if (!this.waste?.length) return;

    for (let i = this.waste.length - 1; i >= 0; i--) {
      this.waste[i].move({
        x: this.position.x - 2.3 - i * 0.43,
        y: this.position.y,
        z: this.position.z + 0.01 * (this.waste.length - i),
      });
    }
  }

  removeCard(card) {
    this.waste.splice(this.waste.indexOf(card), 1);
  }

  reset(deck) {
    this.deck = deck;
    this.deck.cards.forEach((card) => {
      if (card.up) card.flip();
      card.move(this.position);
    });
  }
}
