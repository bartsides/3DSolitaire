export class Foundation {
    cards = [];
    number;
    position;

    constructor(number, position) {
        this.number = number;
        this.position = position;
    }

    addCard(card) {
        this.cards.unshift(card);
        if (card.callback) card.callback(card);
        card.callback = this.removeCard;
        this.recalculate();
    }

    recalculate() {
        let verticalSpacer = .5;
        for (let i = 1; i < this.cards.length; i++) {
            const card = this.cards[i];
            card.card.position.set(this.position.x, this.position.y, this.position.z);
        }
    }

    removeCard(card) {
        this.cards.splice(this.cards.indexOf(card), 1);
        if (this.cards.length) this.cards[0].flip();
    }
}