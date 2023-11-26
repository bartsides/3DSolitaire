import * as THREE from "three";
import { Deck } from "./deck";

export class Stockpile {
  name = "stockpile";
  deck = new Deck();
  position;
  mesh;
  wasteMesh;
  waste = [];
  cardsDrawn;

  constructor(position, meshPosition, scene, highlightZones, cardsDrawn) {
    this.position = position;
    this.cardsDrawn = cardsDrawn;

    const color = highlightZones ? 0xffffff : 0x078c11;
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 3, 0.01),
      new THREE.MeshBasicMaterial({ color: color })
    );
    this.mesh.name = this.name;
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
    // TODO: Add discard
    this.waste.forEach((card) => {
      this.deck.cards.push(card);
      card.move(this.position, this.name);
      card.flip();
    });
    this.waste = [];

    const cardsToDraw = Math.min(this.cardsDrawn, this.deck.cards.length);
    for (let i = 0; i < cardsToDraw; i++) {
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
      this.waste[i].move(
        {
          x: this.position.x - 2.3 - i * 0.43,
          y: this.position.y,
          z: this.position.z + 0.01 * (this.waste.length - i),
        },
        this.name
      );
    }
  }

  removeCard(card) {
    this.waste.splice(this.waste.indexOf(card), 1);
    // TODO: Alter to show previously drawn cards and add functionality to recreate stockpile from discard
    if (!this.waste.length) this.drawCards();
  }

  reset(deck) {
    this.deck.cards = [];
    this.deck.discard = [];

    for (let i = 0; i < deck.cards.length; i++) {
      this.deck.cards[i] = deck.cards[i];
    }

    this.deck.cards.forEach((card) => {
      if (card.up) card.flip();
      card.move(this.position, this.name);
    });
  }
}
