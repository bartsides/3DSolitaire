import { Constants } from "../config/constants";
import { Suit } from "../config/suit";
import * as THREE from "three";

export class Card {
  name;
  suit;
  face;
  rank;
  mesh;
  up = false;
  flip = false;
  red;
  position = new THREE.Vector3(0, 0, 0);
  parent;

  // Animation
  animationMixer;
  flipAction;
  moveAction;
  rotations = {
    up: new THREE.Quaternion(0, 0, 0, 1),
    down: new THREE.Quaternion(0, 0, 1, 0),
  };

  constructor(suit, face, rank, mesh) {
    this.suit = suit;
    this.face = face;
    this.rank = rank;
    this.red = this.suit === Suit.Diamonds || this.suit === Suit.Hearts;

    this.mesh = mesh;
    this.name = this.mesh.name;
    this.setQuaternion(this.rotations.down);
    this.animationMixer = new THREE.AnimationMixer(this.mesh);
  }

  setQuaternion(q) {
    this.mesh.quaternion.set(q.x, q.y, q.z, q.w);
  }

  move(position, parent) {
    this.parent = parent;

    // Compare positions and determine if card is actually moving
    if (this.flip) {
      this._moveAndFlip(position);
    } else {
      this._move(position);
    }
  }

  _move(position) {
    // Cards have y and z coordinates flipped. Correcting here.
    const values = [
      this.position.x,
      this.position.z,
      this.position.y,
      position.x,
      position.z,
      position.y,
    ];
    this.position = position;

    const positionKF = new THREE.VectorKeyframeTrack(
      ".position",
      [0, Constants.animationTime],
      values
    );
    const clip = new THREE.AnimationClip(`move card to ${this.parent}`, -1, [
      positionKF,
    ]);
    if (this.moveAction) this._removeAction(this.moveAction);
    this.moveAction = this.animationMixer.clipAction(clip);
    this._playAction(this.moveAction);
  }

  _moveAndFlip(position) {
    this._flip();

    // Cards have y and z coordinates flipped. Correcting here.
    const values = [
      this.position.x,
      this.position.z,
      this.position.y,
      this.position.x,
      this.position.z,
      this.position.y - 1,
      position.x,
      position.z,
      position.y,
    ];
    this.position = position;

    const positionKF = new THREE.VectorKeyframeTrack(
      ".position",
      [0, Constants.animationTime / 3, Constants.animationTime],
      values
    );
    const clip = new THREE.AnimationClip(`move card to ${this.parent}`, -1, [
      positionKF,
    ]);
    if (this.moveAction) this._removeAction(this.moveAction);
    this.moveAction = this.animationMixer.clipAction(clip);
    this._playAction(this.moveAction);
  }

  _flip() {
    this.flip = false;
    const start = this.up ? this.rotations.up : this.rotations.down;
    this.up = !this.up;
    const end = this.up ? this.rotations.up : this.rotations.down;

    const rotationKF = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      [0, Constants.animationTime / 3, Constants.animationTime],
      start.toArray().concat(start.toArray()).concat(end.toArray())
    );
    const clip = new THREE.AnimationClip("flip", -1, [rotationKF]);
    if (this.flipAction) this._removeAction(this.flipAction);
    this.flipAction = this.animationMixer.clipAction(clip);
    this._playAction(this.flipAction);
  }

  _playAction(action) {
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();
  }

  _removeAction(action) {
    action.stop();
    this.animationMixer._actions.splice(
      this.animationMixer._actions.indexOf(action),
      1
    );
  }

  tick(delta) {
    this.animationMixer.update(delta);
  }

  static GetFace(i) {
    if (i < 1 || i > 14) throw new Error(`Invalid card face number: '${i}'`);

    if (i === 11) return "J";
    if (i === 12) return "Q";
    if (i === 13) return "K";
    if (i === 14) return "A";

    return i.toString();
  }
}
