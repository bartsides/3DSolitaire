import { Constants } from "./constants";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { Card } from "../components/card";
import { Column } from "../components/column";
import { Deck } from "../components/deck";
import { Foundation } from "../components/foundation";
import { Stockpile } from "../components/stockpile";

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    Constants.width / Constants.height,
    0.1,
    2000
  );
  if (Constants.viewProfile) {
    camera.position.set(0, -15, 3);
    camera.rotateX(THREE.MathUtils.degToRad(70));
  } else {
    camera.position.z = Constants.cameraHeight;
  }
  return camera;
}

async function createDeck(scene, clickableObjects) {
  const deck = new Deck();

  let loader = new GLTFLoader();
  const gltf = await loader.loadAsync("Deck_of_Cards.glb");
  gltf.scene.rotateX(Math.PI / 2);
  gltf.scene.scale.set(
    Constants.cardScale,
    Constants.cardScale,
    Constants.cardScale
  );
  scene.add(gltf.scene);

  Constants.suits.forEach((suit) =>
    Constants.faces.forEach((face, rank) => {
      const cardScene = gltf.scene.children.find(
        (card) => card.name == `${face}of${suit}`
      );

      if (!cardScene) console.error("no card found", face, suit);

      deck.cards.push(new Card(suit, face, rank + 1, cardScene));
      clickableObjects.push(cardScene);
    })
  );
  return deck;
}

function createLight(scene) {
  let directionalLight = new THREE.DirectionalLight(0xffffff, 0.85);
  directionalLight.position.z = Constants.lightHeight;
  scene.add(directionalLight);
}

function createTable(scene, clickableObjects, gameOptions) {
  let columns = [],
    foundations = [];

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
    columns.push(column);
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
    foundations.push(foundation);
  }

  const stockpile = new Stockpile(
    { x: columnPositions[6], y: foundationY, z: foundationZ },
    { x: columnMeshPositions[6], y: foundationMeshY, z: foundationMeshZ },
    scene,
    Constants.highlightZones,
    gameOptions.cardsDrawn
  );
  clickableObjects.push(stockpile.mesh, stockpile.wasteMesh);

  return {
    columns,
    foundations,
    stockpile,
  };
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(Constants.width, Constants.height);
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  document.body.appendChild(renderer.domElement);

  return renderer;
}

export { createCamera, createDeck, createLight, createTable, createRenderer };
