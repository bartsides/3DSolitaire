import * as THREE from "three";

function createTable(scene, lightHeight) {
  const depth = 0.0001;
  const geometry = new THREE.BoxGeometry(22, 14.5, depth);
  const material = new THREE.MeshBasicMaterial({ color: 0x078c11 });
  const cube = new THREE.Mesh(geometry, material);
  cube.translateZ(-depth);
  scene.add(cube);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.85);
  directionalLight.position.z = lightHeight;
  scene.add(directionalLight);
}

export { createTable };
