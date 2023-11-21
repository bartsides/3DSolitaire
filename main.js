import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Card } from "./card";
import { Deck } from "./deck";
import { Faces } from "./faces";
import { Stockpile } from "./stockpile";
import { Suits } from "./suit";
import { Column } from "./column";
import { Foundation } from "./foundation";
import { createTable } from "./table";

const highlightZones = true,
  viewProfile = false,
  width = 1200,
  height = 800,
  cameraHeight = 10,
  lightHeight = 100,
  cardScale = 1.3,
  columnSpacer = 2.3,
  columnMeshSpacer = 3,
  clickableObjects = [],
  mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster(),
  scene = new THREE.Scene(),
  renderer = new THREE.WebGLRenderer(),
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);

var faces = Faces,
  suits = Suits,
  loading = true,
  stockpile,
  columns = [],
  foundations = [],
  originalDeck = new Deck();

init();

function init() {
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  if (viewProfile) {
    camera.position.set(0, -15, 3);
    camera.rotateX(THREE.MathUtils.degToRad(70));
  } else {
    camera.position.z = cameraHeight;
  }

  createTable(scene, lightHeight);

  let columnPositions = [
    -columnSpacer * 3,
    -columnSpacer * 2,
    -columnSpacer,
    0,
    columnSpacer,
    columnSpacer * 2,
    columnSpacer * 3,
  ];
  let columnMeshPositions = [
    -columnMeshSpacer * 3,
    -columnMeshSpacer * 2,
    -columnMeshSpacer,
    0,
    columnMeshSpacer,
    columnMeshSpacer * 2,
    columnMeshSpacer * 3,
  ];
  columnPositions.forEach((pos, i) => {
    const colPos = { x: pos, y: -2, z: 0.05 };
    const meshPos = { x: columnMeshPositions[i], y: -1.5, z: 0 };
    const column = new Column(i, colPos, meshPos, scene, highlightZones);
    clickableObjects.push(column.mesh);
    columns.push(column);
  });

  let foundationY = -4;
  let foundationZ = 0.05;
  let foundationMeshY = 5.2;
  let foundationMeshZ = 0;
  for (let i = 0; i < 4; i++) {
    const pos = { x: columnPositions[i], y: foundationY, z: foundationZ };
    const meshPos = {
      x: columnMeshPositions[i],
      y: foundationMeshY,
      z: foundationMeshZ,
    };
    const foundation = new Foundation(i, pos, meshPos, scene, highlightZones);
    clickableObjects.push(foundation.mesh);
    foundations.push(foundation);
  }

  stockpile = new Stockpile(
    { x: columnPositions[6], y: foundationY, z: foundationZ },
    { x: columnMeshPositions[6], y: foundationMeshY, z: foundationMeshZ },
    scene,
    highlightZones
  );
  clickableObjects.push(stockpile.mesh, stockpile.wasteMesh);

  document.addEventListener("click", onClick);

  const loader = new GLTFLoader();
  loader.load("Deck_of_Cards.glb", loadCards, undefined, console.error);
}

function loadCards(gltf) {
  gltf.scene.rotateX(Math.PI / 2);
  gltf.scene.scale.set(cardScale, cardScale, cardScale);
  scene.add(gltf.scene);

  suits.forEach((suit) =>
    faces.forEach((face, rank) => loadCard(gltf, face, rank + 1, suit))
  );

  loaded();
}

var loadCard = function (gltf, face, rank, suit) {
  const cardScene = gltf.scene.children.find(
    (card) => card.name == `${face}of${suit}`
  );

  if (!cardScene) console.log("no card found", face, suit);

  originalDeck.cards.push(new Card(suit, face, rank, cardScene));
};

var loaded = function () {
  render();
  startGame();
};

function startGame() {
  loading = false;

  originalDeck.shuffle();
  const deck = new Deck();
  originalDeck.cards.forEach((card, i) => (deck.cards[i] = card));
  stockpile.reset(deck);

  columns.forEach((c) => (c.cards = []));
  foundations.forEach((f) => (f.cards = []));

  // Deal cards
  for (let j = 0; j < 7; j++) {
    for (let i = j; i < 7; i++) {
      dealCard(columns[i], i === j);
    }
  }

  columns.forEach((c) => c.recalculate());

  stockpileClicked();
}

function dealCard(column, flip) {
  const card = stockpile.drawCard();
  if (flip) card.flip();
  column.addCard(card);
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function onClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / width) * 2 - 1;
  mouse.y = -(event.clientY / height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersections = raycaster.intersectObjects(clickableObjects, false);
  for (let i = 0; i < intersections.length; i++) {
    const obj = intersections[i];
    const name = obj.object.name;

    if (name === "stockpile") {
      stockpileClicked();
      return;
    }
    if (name === "waste") {
      wasteClicked();
      return;
    }

    const foundation = foundations.find((f) => f.name === name);
    if (foundation) {
      foundationClicked(foundation);
      return;
    }

    const column = columns.find((c) => c.name === name);
    if (column) {
      columnClicked(column);
      return;
    }
  }
}

function stockpileClicked() {
  console.log("stockpile clicked", stockpile);
  stockpile.drawCards();
}

function wasteClicked() {
  console.log("waste clicked", stockpile.waste);
  if (!stockpile?.waste?.length) return;

  playCard(stockpile.waste[0], stockpile);
}

function foundationClicked(foundation) {
  console.log("foundation clicked", foundation);
}

function columnClicked(column) {
  for (let i = column.cards.length - 1; i >= 0; i--) {
    const card = column.cards[i];
    if (!card.up) continue;

    let remainder = [];
    for (let j = i; j >= 0; j--) remainder.push(card);

    playCard(card, column, remainder);
  }
}

function playCard(card, source, remainder) {
  if (!remainder?.length) {
    const foundation = findFoundation(card);
    if (foundation?.isValidPlay(card)) {
      foundation.addCard(card, source);
      return;
    }
  }

  columns.forEach((col) => {
    if (col.isValidPlay(card)) {
      col.addCard(card, source);

      if (!remainder?.length) return;

      for (let i = 0; i < remainder.length; i++) {
        col.addCard(remainder[i], source);
      }
      return;
    }
  });
}

function findFoundation(card) {
  // Check foundations that are set
  let foundation = foundations.find((f) => f.suit === card.suit);
  if (foundation) return foundation;

  for (let i = 0; i < foundations.length; i++) {
    if (!foundations[i].suit) return foundations[i];
  }
}
