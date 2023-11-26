import * as THREE from "three";
import { createCamera, createRenderer } from "../config/setup";
import { Constants } from "../config/constants";
import { Table } from "./table";

let gameOptions = {
  cardsDrawn: 1,
  highlightZones: false,
  viewProfile: false,
};

let loading = true,
  scene,
  renderer,
  clickableObjects = [],
  raycaster,
  camera,
  table;

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

class Game {
  constructor() {
    renderer = createRenderer();
    camera = createCamera();

    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();
    table = new Table(gameOptions);

    render();

    document.addEventListener("click", this.onClick);
  }

  async init() {
    await table.init(scene, clickableObjects);
  }

  startNewGame() {
    loading = false;
    table.newGame();
  }

  onClick(event) {
    event.preventDefault();

    const mouse = new THREE.Vector2(
      (event.clientX / Constants.width) * 2 - 1,
      -(event.clientY / Constants.height) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);

    const intersections = raycaster.intersectObjects(clickableObjects, false);
    for (let i = 0; i < intersections.length; i++) {
      const name = intersections[i].object.name;

      if (name === "stockpile") {
        stockpileClicked();
        return;
      }

      if (name === "waste") {
        wasteClicked();
        return;
      }

      const foundation = table.foundations.find((f) => f.name === name);
      if (foundation) {
        foundationClicked(foundation);
        return;
      }

      const column = table.columns.find((c) => c.name === name);
      if (column) {
        columnClicked(column);
        return;
      }

      const card = table.originalDeck.cards.find((c) => c.name === name);
      if (card && card.up) {
      }

      // TODO: Check for cards
    }
  }
}

var stockpileClicked = function () {
  table.stockpile.drawCards();
};

var wasteClicked = function () {
  if (!table.stockpile.waste.length) return;
  playCards([table.stockpile.waste[0]], table.stockpile);
};

var foundationClicked = function (foundation) {
  if (!foundation.cards.length) return;
  playCards([foundation.cards[0]], foundation);
};

var columnClicked = function (column) {
  for (let i = column.cards.length - 1; i >= 0; i--) {
    if (!column.cards[i].up) continue;

    const cards = [];
    for (let j = i; j >= 0; j--) cards.push(column.cards[j]);

    playCards(cards, column);
    return;
  }
};

var playCards = function (cards, source) {
  let plays = findPlays(cards, source);
  if (!plays.foundation && !plays.columnPlays.length) return;

  // TODO: Smarter logic on which action to take
  // TODO: Handle scenario where best play is to move top / last card to foundation
  let destination,
    selectedCards = [];

  if (plays.foundation) {
    destination = plays.foundation;
    selectedCards = [cards[cards.length - 1]];
  } else {
    let columnPlay = plays.columnPlays[0];
    destination = columnPlay.column;
    selectedCards = columnPlay.cards;
  }

  if (destination) {
    applyPlay(selectedCards, source, destination);
  } else {
    console.error("unable to determine move", selectedPlay);
  }
};

var applyPlay = function (cards, source, destination) {
  for (let i = 0; i < cards.length; i++) {
    destination.addCard(cards[i]);
    source.removeCard(cards[i]);
  }
};

var findPlays = function (cards, source) {
  let foundation,
    columnPlays = [];

  // Only top card can move to foundation
  const topCard = cards[cards.length - 1];
  let f = findFoundation(topCard);
  if (f && f.name !== source.name && f.isValidPlay(topCard)) {
    foundation = f;
  }

  for (let i = 0; i < cards.length; i++) {
    let cols = [],
      card = cards[i];

    table.columns.forEach((col) => {
      if (col.name !== source.name && col.isValidPlay(card)) {
        cols.push(col);
      }
    });

    if (!cols.length) continue;

    let selectedCards = [];
    for (let j = cards.length - 1; j >= i; j--) selectedCards.unshift(cards[j]);

    cols.forEach((col) =>
      columnPlays.push({
        column: col,
        cards: selectedCards,
      })
    );
  }

  return { foundation, columnPlays };
};

var findFoundation = function (card) {
  // Check foundations that are set
  let foundations = table.foundations;
  let foundation = foundations.find((f) => f.suit === card.suit);
  if (foundation) return foundation;

  for (let i = 0; i < foundations.length; i++) {
    if (!foundations[i].suit) return foundations[i];
  }
};

export { Game };
