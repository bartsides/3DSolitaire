export class Positions {
    columnSpacer = 2.2;
    width;
    height;

    stockpile = { x: this.columnSpacer*3, y: 0, z: -4 };
    foundation1 = { x: -this.columnSpacer*3, y: 0, z: -2 };
    foundation2 = { x: -this.columnSpacer*2, y: 0, z: -2 };
    foundation3 = { x: -this.columnSpacer, y: 0, z: -2 };
    foundation4 = { x: 0, y: 0, z: -2 };
    column1 = { x: -this.columnSpacer*3, y: 0, z: -2 };
    column2 = { x: -this.columnSpacer*2, y: 0, z: -2 };
    column3 = { x: -this.columnSpacer, y: 0, z: -2 };
    column4 = { x: 0, y: 0, z: -2 };
    column5 = { x: this.columnSpacer, y: 0, z: -2 };
    column6 = { x: this.columnSpacer*2, y: 0, z: -2 };
    column7 = { x: this.columnSpacer*3, y: 0, z: -2 };

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    setColumns() {

    }
}