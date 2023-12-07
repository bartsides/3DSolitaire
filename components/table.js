import * as THREE from "three";
import { Constants } from "../config/constants";
import { Column } from "./column";
import { Foundation } from "./foundation";
import { Stockpile } from "./stockpile";
import { createDeck, createLight, createTable } from "../config/setup";

class Table {
  columns = [];
  foundations = [];
  stockpile;
  originalDeck;
  gameOptions;

  constructor(gameOptions) {
    this.gameOptions = gameOptions;
  }

  async init(scene, clickableObjects) {
    const { columns, foundations, stockpile } = createTable(
      scene,
      clickableObjects,
      this.gameOptions
    );
    this.columns = columns;
    this.foundations = foundations;
    this.stockpile = stockpile;

    createLight(scene);
    this.originalDeck = await createDeck(scene, clickableObjects);
  }

  newGame() {
    this.columns.forEach((c) => (c.cards = []));
    this.foundations.forEach((f) => (f.cards = []));

    this.originalDeck.shuffle();
    this.stockpile.reset(this.originalDeck);

    // Deal cards
    for (let j = 0; j < 7; j++) {
      for (let i = j; i < 7; i++) {
        const card = this.stockpile.drawCard();
        if (i === j) card.flip = true;
        this.columns[i].addCard(card);
      }
    }

    this.columns.forEach((c) => c.recalculate());

    this.stockpile.drawCards();
  }

  tick(delta) {
    this.columns.forEach((c) => c.tick(delta));
    this.foundations.forEach((f) => f.tick(delta));
    this.stockpile?.tick(delta);
  }

  createTable(scene, clickableObjects) {
    let depth = 0.0001;
    let cube = new THREE.Mesh(
      new THREE.BoxGeometry(22, 14.5, depth),
      new THREE.MeshBasicMaterial({ color: 0x078c11 })
    );
    cube.translateZ(-depth);
    scene.add(cube);

    let columnPositions = [
      -Constants.columnSpacer * 3,
      -Constants.columnSpacer * 2,
      -Constants.columnSpacer,
      0,
      Constants.columnSpacer,
      Constants.columnSpacer * 2,
      Constants.columnSpacer * 3,
    ];
    let columnMeshPositions = [
      -Constants.columnMeshSpacer * 3,
      -Constants.columnMeshSpacer * 2,
      -Constants.columnMeshSpacer,
      0,
      Constants.columnMeshSpacer,
      Constants.columnMeshSpacer * 2,
      Constants.columnMeshSpacer * 3,
    ];
    columnPositions.forEach((pos, i) => {
      let colPos = { x: pos, y: -2, z: 0.05 };
      let meshPos = { x: columnMeshPositions[i], y: -1.5, z: 0 };
      let column = new Column(
        i,
        colPos,
        meshPos,
        scene,
        Constants.highlightZones
      );
      clickableObjects.push(column.mesh);
      this.columns.push(column);
    });

    let foundationY = -4;
    let foundationZ = 0.05;
    let foundationMeshY = 5.2;
    let foundationMeshZ = 0;
    for (let i = 0; i < 4; i++) {
      let pos = { x: columnPositions[i], y: foundationY, z: foundationZ };
      let meshPos = {
        x: columnMeshPositions[i],
        y: foundationMeshY,
        z: foundationMeshZ,
      };
      let foundation = new Foundation(
        i,
        pos,
        meshPos,
        scene,
        Constants.highlightZones
      );
      clickableObjects.push(foundation.mesh);
      this.foundations.push(foundation);
    }

    this.stockpile = new Stockpile(
      { x: columnPositions[6], y: foundationY, z: foundationZ },
      { x: columnMeshPositions[6], y: foundationMeshY, z: foundationMeshZ },
      scene,
      Constants.highlightZones,
      this.gameOptions.cardsDrawn
    );
    clickableObjects.push(this.stockpile.mesh, this.stockpile.wasteMesh);
  }
}

export { Table };
