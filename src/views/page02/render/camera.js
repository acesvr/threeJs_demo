import * as THREE from 'three';
import { track } from './track';
import TWEEN from "@tweenjs/tween.js";
var camera = track(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000));

const setCamera = (x, y, z) => {
    camera.position.set(x, y, z);
    camera.target = new THREE.Vector3(0, 0, 0);
    return camera;
}

const setCameraByTween = (x, y, z) => {
    new TWEEN.Tween(camera.position)
        .to({ x, y, z }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
}


setCamera(300, 0, 0);


export { camera, setCamera, setCameraByTween }