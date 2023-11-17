import * as THREE from 'three';

function createTable(scene, positions, lightHeight) {
    const geometry = new THREE.BoxGeometry( positions.width/2.05, positions.height/2.05, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x078c11 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.translateZ(-10);
    scene.add( cube );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.85 );
    directionalLight.position.z = lightHeight;
    scene.add( directionalLight );
}

export { createTable }