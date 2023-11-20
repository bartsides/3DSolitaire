import * as THREE from 'three';

function createTable(scene, positions, lightHeight) {
    const geometry = new THREE.BoxGeometry( positions.width/5, positions.height/5, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x078c11 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.translateZ(-100);
    scene.add( cube );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.85 );
    directionalLight.position.z = lightHeight;
    scene.add( directionalLight );
}

export { createTable }