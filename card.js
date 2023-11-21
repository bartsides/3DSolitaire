import { Suit } from "./suit";

export class Card {
  suit;
  face;
  faceNumber;
  card;
  up = false;
  red;
  position;
  name;
  callback;
  columnNumber = undefined;

  constructor(suit, face, faceNumber, card) {
    this.suit = suit;
    this.face = face;
    this.faceNumber = faceNumber;
    this.red = this.suit === Suit.Diamonds || this.suit === Suit.Hearts;

    this.card = card;
    this.name = this.card.name;
    this.card.rotateX(Math.PI);
  }

  flip() {
    this.up = !this.up;
    this.card.rotateX(Math.PI);
  }

  move(position, columnNumber) {
    // Cards have y and z coordinates flipped. Correcting here.
    this.position = position;
    this.card.position.set(position.x, position.z, position.y);
    this.columnNumber = columnNumber;
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
