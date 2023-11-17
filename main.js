import * as THREE from 'three';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Positions } from './positions';
import { Card } from './card';
import { Deck } from './deck';
import { Suit } from './suit';

const width = 1200, 
    height = 800, 
    cameraHeight = 10, 
    lightHeight = 100, 
    cardScale = 1;

var faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
var suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];
var loading = true;

const cardObjects = [];
const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
var selectedCard;

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

var positions = new Positions(width, height);
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
camera.position.z = cameraHeight;

var deck = new Deck();
var originalDeck;
// var controls;
// controls = new DragControls( [ ... objects ], camera, renderer.domElement );
// controls.addEventListener( 'drag', drag );
const loader = new GLTFLoader();
loader.load('Deck_of_Cards.glb', loadCards, undefined, err => console.error(err));
// loader.load('bicycle_card_blue.glb', function (gltf) {
//     console.log(gltf);
//     gltf.scene.rotateX(Math.PI / 2);
//     scene.add(gltf.scene);
// }, undefined, err => console.error(err));

document.addEventListener( 'click', onClick );


function startGame() {
    //scene.clear();
    
    createTable();
    // Reset card locations?

    deck.cards.forEach((card) =>{
        positions.set(card, positions.stockpile);
    });
    
    let card = deck.cards.shift();
    //card.flip();
    positions.set(card, positions.column1);
    // TODO: Raise top stockpile
}

var loaded = function() {
    loading = false;
    animate();
    startGame();
}

var loadCard = function(gltf, face, faceNumber, suit) {
    const cardScene = gltf.scene.children.find((card) => card.name == `${face}of${suit}`);
    if (!cardScene) {
        console.log('no card found', face, suit);
    }
    
    cardObjects.push(cardScene);
    deck.cards.push(new Card(suit, face, faceNumber, cardScene));
}

function loadCards(gltf) {
    gltf.scene.rotateX(Math.PI / 2);
    gltf.scene.scale.set(cardScale, cardScale, cardScale);
    scene.add(gltf.scene);

    suits.forEach(suit => {
        faces.forEach((face, faceNumber) => {
            loadCard(gltf, face, faceNumber + 1, suit);
        });
    });

    originalDeck = JSON.parse(JSON.stringify(deck));

    loaded();
}

function createTable() {
    const geometry = new THREE.BoxGeometry( width/2.05, height/2.05, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x078c11 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.translateZ(-10);
    scene.add( cube );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.85 );
    directionalLight.position.z = lightHeight;
    scene.add( directionalLight );
}

function drag(a) {
    console.log('drag');
    selectedCard = a.object;
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function onClick(event) {
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    const intersections = raycaster.intersectObjects( cardObjects, true );
    selectedCard = undefined;
    console.log(intersections);
    intersections.every((obj) => {
        console.log(obj.object.name);
        const card = originalDeck.cards.find(card => card.name === obj.object.name);
        if (card) {
            selectedCard = card;
            return true;
        }
    });

    console.log('selectedCard', selectedCard);

    if (selectedCard) {
        placeCard(selectedCard, intersections);
        selectedCard = undefined;
    }
}

function placeCard(card, intersections) {
    console.log('placeCard', card);
    let obj;
    intersections.forEach(o => {
        if (obj) return;
        console.log(o);
    });
    //card.flip();
}