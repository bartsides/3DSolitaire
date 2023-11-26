import { Suit } from "../config/suit";

export class Card {
  rotations = {
    up: 0,
    down: Math.PI,
  };
  suit;
  face;
  rank;
  card;
  up = false;
  red;
  position;
  name;
  callback;

  constructor(suit, face, rank, card) {
    this.suit = suit;
    this.face = face;
    this.rank = rank;
    this.red = this.suit === Suit.Diamonds || this.suit === Suit.Hearts;

    this.card = card;
    this.name = this.card.name;
    this.card.rotateX(this.rotations.down);
  }

  flip() {
    this.up = !this.up;
    this.card.rotateX(Math.PI);
  }

  move(position) {
    // Cards have y and z coordinates flipped. Correcting here.
    this.position = position;
    this.card.position.set(position.x, position.z, position.y);
  }

  static GetFace(i) {
    if (i < 1 || i > 14) throw new Error(`Invalid card face number: '${i}'`);

    if (i === 11) return "J";
    if (i === 12) return "Q";
    if (i === 13) return "K";
    if (i === 14) return "A";

    return i.toString();
  }
}
