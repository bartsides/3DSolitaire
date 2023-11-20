export class Deck {
  cards = [];
  discard = [];
  originalOrder;

  constructor() {}

  shuffle() {
    for (let i = 0; i < Math.max(Math.random() * 10, 3); i++) {
      this.cards = this.cards.sort(() => Math.random() - 0.5);
    }
  }

  drawCard() {
    const card = this.cards.shift();
    if (card === undefined) throw new Error("Card undefined");
    return card;
  }
}
