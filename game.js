import * as THREE from "three";
import { createCamera, createRenderer } from "./config/setup";
import { Constants } from "./config/constants";
import { Table } from "./components/table";
import { Faces } from "./config/faces";

let gameOptions = {
  cardsDrawn: 1,
  highlightZones: false,
  viewProfile: false,
};

let loading = true,
  scene,
  renderer,
  clickableObjects = [],
  menuObjects = [],
  raycaster,
  camera,
  table,
  clock;

function render() {
  requestAnimationFrame(render);

  animate(clock.getDelta());

  renderer.render(scene, camera);
}

function animate(delta) {
  table.tick(delta);
}

class Game {
  constructor() {
    renderer = createRenderer();
    camera = createCamera();

    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();
    table = new Table(gameOptions);
    clock = new THREE.Clock();

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

    // Complete animations
    animate(100);

    const mouse = new THREE.Vector2(
      (event.clientX / Constants.width) * 2 - 1,
      -(event.clientY / Constants.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);

    const menuIntersections = raycaster.intersectObjects(menuObjects, false);
    for (let i = 0; i < menuIntersections.length; i++) {}

    let skipCards = false;
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
        if (foundationClicked(foundation)) return;
        continue;
      }

      const column = table.columns.find((c) => c.name === name);
      if (column) {
        if (columnClicked(column)) return;
        continue;
      }

      if (!skipCards) {
        const card = table.originalDeck.cards.find((c) => c.name === name);
        if (card && card.up) {
          if (cardClicked(card)) return;

          // If a card is clicked in a column, try to play it and then try the column
          skipCards = true;
          continue;
        }
      }
    }
  }
}

var stockpileClicked = function () {
  table.stockpile.drawCards();
};

var wasteClicked = function () {
  if (!table.stockpile.waste.length) return;
  return playCards([table.stockpile.waste[0]], table.stockpile);
};

var foundationClicked = function (foundation) {
  if (!foundation.cards.length) return;
  return playCards([foundation.cards[0]], foundation);
};

var columnClicked = function (column, card) {
  let i = column.cards.length - 1;
  if (card) {
    // Start with index of card clicked
    for (let j = 0; j < column.cards.length; j++) {
      if (card.name === column.cards[j].name) {
        i = j;
        break;
      }
    }
  }

  let stop = card ? i : 0;
  for (; i >= stop; i--) {
    if (!column.cards[i].up) continue;

    const cards = [];
    for (let j = i; j >= 0; j--) cards.push(column.cards[j]);

    return playCards(cards, column);
  }
};

var cardClicked = function (card) {
  if (card.parent === "stockpile") {
    // Cards in stockpile are always face down so if a card has
    // been clicked it's in the waste pile
    wasteClicked();
    return true;
  }

  if (card.parent.includes("foundation")) {
    const number = parseInt(card.parent[card.parent.length - 1]);
    return foundationClicked(table.foundations[number]);
  }

  if (card.parent.includes("column")) {
    const number = parseInt(card.parent[card.parent.length - 1]);
    return columnClicked(table.columns[number], card);
  }
};

var playCards = function (cards, source) {
  let plays = findPlays(cards, source);
  if (!plays.foundation && !plays.columnPlays.length) return false;

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
    return true;
  } else {
    console.error("unable to determine move", selectedPlay);
  }
  return false;
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

  if (!cards?.length) return { foundation, columnPlays };

  // Only top card can move to foundation
  const topCard = cards[cards.length - 1];
  let f = findFoundation(topCard);
  if (f && f.name !== source.name && f.isValidPlay(topCard)) {
    foundation = f;
  }

  let skipFirstCard = false;
  if (source.name.includes("column")) {
    const baseCard = source.cards[source.cards.length - 1];
    const firstCard = cards[0];
    skipFirstCard =
      baseCard.face === Faces[Faces.length - 1] &&
      baseCard.face === firstCard.face &&
      baseCard.suit === firstCard.suit;
  }

  for (let i = 0; i < cards.length; i++) {
    let cols = [],
      card = cards[i];

    if (skipFirstCard) {
      // King is already base card in column. No need to check other columns.
      continue;
    }

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
