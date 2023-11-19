export class Column {
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

    removeCard(card) {
        this.cards.splice(this.cards.indexOf(card), 1);
        if (this.cards.length) this.cards[0].flip();
    }

    recalculate() {
        if (!this.cards?.length) return;

        let ySpacer = .1;
        let zSpacer = .5;
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];

            card.move({
                x: this.position.x, 
                y: this.position.y + ySpacer*(this.cards.length - 1), 
                z: this.position.z + zSpacer*(this.cards.length - i)
            });
        }
    }
}