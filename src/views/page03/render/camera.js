import * as THREE from 'three'
import { track } from './track'

const setCamera = (x, y, z) => {
    // const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 1000000);
    camera = track(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000));
    camera.position.set(x, y, z)
    return camera
}



var camera = setCamera(300, 0, 0)

// testRender(camera)//相机调试函数

export { camera,setCamera }