export class Positions {
    width;
    height;

    stockpile = { x: 2, y: 0, z: -5 };
    foundation1 = { x: -10, y: 0, z: -5 };
    foundation2 = { x: -8, y: 0, z: -5 };
    foundation3 = { x: -6, y: 0, z: -5 };
    foundation4 = { x: -4, y: 0, z: -5 };
    column1 = { x: -10, y: 0, z: -2 };
    column2 = { x: -8, y: 0, z: -2 };
    column3 = { x: -6, y: 0, z: -2 };
    column4 = { x: -4, y: 0, z: -2 };
    column5 = { x: -2, y: 0, z: -2 };
    column6 = { x: 0, y: 0, z: -2 };
    column7 = { x: 2, y: 0, z: -2 };

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}