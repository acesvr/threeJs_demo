import * as THREE from 'three'
import ResourceTracker from "@/utils/TrackResource.js"; //页面销毁时清理threejs的内存

let resMgr = new ResourceTracker();// 在外层定义resMgr和track
var track = resMgr.track.bind(resMgr);

const setCamera = (x, y, z) => {
    // const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 1000000);
    camera = track(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000));
    camera.position.set(x, y, z)
    return camera
}

const testRender = (camera) => {
    function renderCamera() {
        console.log("相机x+" + camera.position.x + "+相机y" + camera.position.y + "+相机z+" + camera.position.z)
    }
    document.addEventListener('mousemove', renderCamera);
}


/*** 重置相机*/
const resetCamera = () => {
    camera.position.set(300, 0, 0);
    camera.target = new THREE.Vector3(0, 0, 0);
}

var camera = setCamera(300, 0, 0)

// testRender(camera)//相机调试函数





export { camera, testRender, resetCamera }