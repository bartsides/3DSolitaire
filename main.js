import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Card } from "./card";
import { Deck } from "./deck";
import { Suit } from "./suit";
import { Column } from "./column";
import { Foundation } from "./foundation";
import { createTable } from "./table";

const highlightZones = true,
  width = 1200,
  height = 800,
  cameraHeight = 10,
  lightHeight = 100,
  cardScale = 1.3,
  columnSpacer = 2.2,
  columnMeshSpacer = 3,
  stockpile = { x: columnSpacer * 3, y: 0, z: -4 };

var faces = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
    "Ace",
  ],
  suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades],
  loading = true,
  columns = [],
  foundations = [],
  deck = new Deck(),
  originalDeck = new Deck();

const clickableObjects = [];
const mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster();

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
camera.position.z = cameraHeight;

init();

function startGame() {
  loading = false;

  originalDeck.shuffle();
  deck = new Deck();
  originalDeck.cards.forEach((card, index) => (deck.cards[index] = card));
  deck.cards.forEach((card) => {
    if (card.up) card.flip();
    card.move(stockpile);
  });

  columns.forEach((column) => (column.cards = []));
  foundations.forEach((foundation) => (foundation.cards = []));

  // Deal cards
  for (let j = 0; j < 7; j++) {
    for (let i = j; i < 7; i++) {
      dealCard(columns[i], i === j);
    }
  }

  columns.forEach((column) => column.recalculate());
}

function dealCard(column, flip) {
  const card = deck.cards.shift();
  if (flip) card.flip();
  column.cards.unshift(card);
}

function init() {
  createTable(scene, lightHeight);

  const colMeshY = -1.5;
  const colMeshZ = -0.5;
  let columnMeshPositions = [
    -columnMeshSpacer * 3,
    -columnMeshSpacer * 2,
    -columnMeshSpacer,
    0,
    columnMeshSpacer,
    columnMeshSpacer * 2,
    columnMeshSpacer * 3,
  ];
  let columnPositions = [
    { x: -columnSpacer * 3, y: 0, z: -2 },
    { x: -columnSpacer * 2, y: 0, z: -2 },
    { x: -columnSpacer, y: 0, z: -2 },
    { x: 0, y: 0, z: -2 },
    { x: columnSpacer, y: 0, z: -2 },
    { x: columnSpacer * 2, y: 0, z: -2 },
    { x: columnSpacer * 3, y: 0, z: -2 },
  ];
  columnPositions.forEach((pos, index) => {
    const column = new Column(
      index,
      pos,
      { x: columnMeshPositions[index], y: colMeshY, z: colMeshZ },
      scene,
      highlightZones
    );
    clickableObjects.push(column.mesh);
    columns.push(column);
  });

  let foundationMeshY = 5.5;
  let foundationMeshZ = -0.5;
  for (let i = 0; i < 4; i++) {
    const foundation = new Foundation(
      i,
      columnPositions[i],
      { x: columnMeshPositions[i], y: foundationMeshY, z: foundationMeshZ },
      scene,
      highlightZones
    );
    clickableObjects.push(foundation.mesh);
    foundations.unshift(foundation);
  }

  document.addEventListener("click", onClick);
  document.addEventListener("wheel", onScroll, { passive: false });

  const loader = new GLTFLoader();
  loader.load(
    "Deck_of_Cards.glb",
    (gltf) => {
      gltf.scene.rotateX(Math.PI / 2);
      gltf.scene.scale.set(cardScale, cardScale, cardScale);
      scene.add(gltf.scene);

      suits.forEach((suit) =>
        faces.forEach((face, faceNumber) =>
          loadCard(gltf, face, faceNumber + 1, suit)
        )
      );

      loaded();
    },
    undefined,
    (err) => console.error(err)
  );
}

var loadCard = function (gltf, face, faceNumber, suit) {
  const cardScene = gltf.scene.children.find(
    (card) => card.name == `${face}of${suit}`
  );

  if (!cardScene) console.log("no card found", face, suit);

  originalDeck.cards.push(new Card(suit, face, faceNumber, cardScene));
};

var loaded = function () {
  render();
  startGame();
};

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
  console.log("intersections", intersections);

  intersections.every((obj) => {
    const foundation = foundations.find(
      (foundation) => foundation.name === obj.object.name
    );
    if (foundation) {
      foundationClicked(foundation);
      return true;
    }

    const column = columns.find((column) => column.name === obj.object.name);
    if (column) {
      columnClicked(column);
      return true;
    }
  });
}

function foundationClicked(foundation) {
  console.log("foundation clicked", foundation);
}

function columnClicked(column) {
  console.log("column clicked", column);
  columns.forEach((col) => {
    if (col.number !== column.column && col.isValid(column)) {
      console.log("valid move", col.number, col.cards[0]);
    }
  });
}

function onScroll(event) {
  console.log("onScroll", event);
  event.preventDefault();
}
