import { Card } from "./card";
import { Suit } from "./suit";

export class Deck {
    cards = [];

    constructor() {
    }

    shuffle() {
        this.cards = [];

        Object.values(Suit).forEach(suit => {
            for (let i = 1; i <= 14; i++) {
                this.cards.push(new Card(suit, i));
            }
        })

        for (let i = 0; i < Math.max(Math.random() * 10, 1); i++) {
            this.cards = this.cards.sort(() => Math.random() - 0.5);
        }
    }

    drawCard() {
        const card = this.cards.shift();
        if (card === undefined)
            throw new Error('Card undefined');
        return card;
    }
}