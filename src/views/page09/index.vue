<template>
    <div id="threeContainer"></div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';



import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';
import LLoading from "@/components/LLoading.vue";
import { NButton, NSlider, NSwitch } from 'naive-ui'
import { track, resMgr } from './render/track'
// import TWEEN from "@tweenjs/tween.js";
var threeContainer;
var scene;
var camera;
var renderer;
var controls;
var viewHelper;
var ambientLight;
var animateID;



onMounted(() => {
    threeContainer = document.getElementById('threeContainer');




    init();
    initHDR();
    initModel();
    threeContainer?.appendChild(renderer.domElement);
});

onUnmounted(() => {
    destroyThreejs()
});

function init() {
    scene = new THREE.Scene();


    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.localClippingEnabled = true;

    // scene.background = track(new THREE.TextureLoader().load('/Bg/background.jpg'))

    ambientLight = new THREE.AmbientLight(0xffffff, 0);    // 环境光
    scene.add(ambientLight);
    camera = track(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000));
    camera.position.set(100, 50, 100)


    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 控制器
    controls = track(new OrbitControls(camera, renderer.domElement));
    viewHelper = new ViewHelper(camera, threeContainer)

    let viewHelperDiv = document.createElement('div')
    viewHelperDiv.className = 'viewhelper';
    renderer.autoClear = false;
    threeContainer.appendChild(viewHelperDiv);
    viewHelperDiv.addEventListener('mousedown', (event) => {
        event.stopPropagation();
        viewHelper.handleClick(event);
    });


    controls.enableZoom = true; //摄像机缩放
    // controls.enablePan = false; //摄像机平移
    controls.enableDamping = true;//启用阻尼（惯性）
    controls.screenSpacePanning = true;
    controls.minDistance = 10;
    controls.maxDistance = 50000;
    controls.update();
    // 创建空间辅助坐标系
    var axesHelper = track(new THREE.AxesHelper(200)); // 参数指定坐标轴的长度
    scene.add(axesHelper);
}

function initHDR() {
    new RGBELoader().setDataType(THREE.FloatType).setPath('/hdr/')
        .load('h2.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping; //设置材质的贴图映射方式为全景反射映射

            scene.environment = track(texture);
            animate()
        })
}

function initModel() {


}


const clock = new THREE.Clock();
const animate = () => {
    animateID = requestAnimationFrame(animate);
    controls.update();
    let delta = clock.getDelta();
    if (viewHelper.animating === true) {
        viewHelper.update(delta);
    }

    viewHelper.render(renderer);
    renderer.render(scene, camera);

}

const destroyThreejs = () => {
    try {
        scene.clear();
        resMgr && resMgr.dispose()
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.content = null;
        cancelAnimationFrame(animateID)
        let gl = renderer.domElement.getContext("webgl");
        gl && gl.getExtension("WEBGL_lose_context").loseContext();
        console.log(renderer.info)   //查看memery字段即可
    } catch (e) {
        console.log(e)
    }
};
</script>
<style scoped>
.read-the-docs {
    color: #888;
}
</style>