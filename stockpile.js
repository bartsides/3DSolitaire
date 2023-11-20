import * as THREE from "three";

export class Stockpile {
  name = "stockpile";
  deck;
  position;
  mesh;

  constructor(position, meshPosition, scene, highlightZones) {
    this.position = position;

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 3, 0.01),
      new THREE.MeshBasicMaterial({
        color: highlightZones ? 0xffffff : 0x078c11,
      })
    );
    this.mesh.name = this.name;
    this.mesh.position.set(meshPosition.x, meshPosition.y, meshPosition.z);
    scene.add(this.mesh);
  }

  drawCard() {
    return this.deck.cards.shift();
  }

  reset(deck) {
    this.deck = deck;
    this.deck.cards.forEach((card) => {
      if (card.up) card.flip();
      card.move(this.position);
    });
  }
}
