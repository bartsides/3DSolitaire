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
  animationTimes = [0, Constants.animationTime];

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

  flip() {
    const start = this.up ? this.rotations.up : this.rotations.down;
    this.up = !this.up;
    const end = this.up ? this.rotations.up : this.rotations.down;

    const values = start.toArray().concat(end.toArray());
    const rotationKF = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      this.animationTimes,
      values
    );
    const clip = new THREE.AnimationClip("flip", -1, [rotationKF]);
    if (this.flipAction) this._removeAction(this.flipAction);
    this.flipAction = this.animationMixer.clipAction(clip);
    this._playAction(this.flipAction);
  }

  move(position, parent) {
    // Cards have y and z coordinates flipped. Correcting here.
    const times = [0, Constants.animationTime];
    const values = [
      this.position.x,
      this.position.z,
      this.position.y,
      position.x,
      position.z,
      position.y,
    ];
    const positionKF = new THREE.VectorKeyframeTrack(
      ".position",
      times,
      values
    );
    const clip = new THREE.AnimationClip(`move card to ${this.parent}`, -1, [
      positionKF,
    ]);

    if (this.moveAction) this._removeAction(this.moveAction);
    this.moveAction = this.animationMixer.clipAction(clip);
    this._playAction(this.moveAction);

    this.position = position;
    this.parent = parent;
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
