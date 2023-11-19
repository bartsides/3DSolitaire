import * as THREE from 'three';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Positions } from './positions';
import { Card } from './card';
import { Deck } from './deck';
import { Suit } from './suit';
import { Column } from './column';
import { Foundation } from './foundation';
import { createTable } from './table';

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

var deck;
var originalDeck = new Deck();
var columns = [
    new Column(0, positions.column1),
    new Column(1, positions.column2),
    new Column(2, positions.column3),
    new Column(3, positions.column4),
    new Column(4, positions.column5),
    new Column(5, positions.column6),
    new Column(6, positions.column7)
];
var foundations = [
    new Foundation(0, positions.foundation1),
    new Foundation(1, positions.foundation2),
    new Foundation(2, positions.foundation3),
    new Foundation(3, positions.foundation4)
];

createTable(scene, positions, lightHeight);
const loader = new GLTFLoader();
loader.load('Deck_of_Cards.glb', loadCards, undefined, err => console.error(err));

document.addEventListener( 'click', onClick );


function startGame() {
    originalDeck.shuffle();
    deck = new Deck();
    originalDeck.cards.forEach((card, index) => deck.cards[index] = card);
    deck.cards.forEach(card => {
        if (card.up) card.flip();
        card.move(positions.stockpile);
    });
    columns.forEach(column => column.cards = []);
    foundations.forEach(foundation => foundation.cards = []);
    
    // Deal cards
    for (let j = 0; j < 7; j++) {
        for (let i = j; i < 7; i++) {
            dealCard(columns[i], i === j);
        }
    }
    columns.forEach(column => column.recalculate());
}

function dealCard(column, flip) {
    const card = deck.cards.shift();
    if (flip) card.flip();
    column.cards.unshift(card);
}

var loaded = function() {
    render();
    loading = false;
    startGame();
}

var loadCard = function(gltf, face, faceNumber, suit) {
    const cardScene = gltf.scene.children.find((card) => card.name == `${face}of${suit}`);
    if (!cardScene) {
        console.log('no card found', face, suit);
    }
    
    cardObjects.push(cardScene);
    originalDeck.cards.push(new Card(suit, face, faceNumber, cardScene));
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

    loaded();
}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function onClick(event) {
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    const intersections = raycaster.intersectObjects( cardObjects, true );
    selectedCard = undefined;
    //console.log(intersections);
    intersections.every((obj) => {
        //console.log(obj.object.name);
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
    //console.log('placeCard', card);
    let obj;
    intersections.forEach(o => {
        if (obj) return;
        //console.log(o);
    });
    //card.flip();
}