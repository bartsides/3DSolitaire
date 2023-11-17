export class Positions {
    width;
    height;

    stockpile = { x: -.008, y: -.0, z: -5};
    column1 = { x: 0, y: 0, z: 0 };

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    set(card, params) {
        card.card.position.set(params.x * this.width, params.y * this.height, params.z);
        card.position = card.card.position;
    }
}