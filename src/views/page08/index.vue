<template>
    <div id="threeContainer"></div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';



import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import LLoading from "@/components/LLoading.vue";
import { NButton, NSlider, NSwitch } from 'naive-ui'
import { track, resMgr } from './render/track'
// import TWEEN from "@tweenjs/tween.js";
var threeContainer;
var scene;
var camera;
var renderer;
var controls;
var ambientLight;
var animateID;
init();
initHDR();
initModel();

onMounted(() => {
    threeContainer = document.getElementById('threeContainer');
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


    // 控制器
    controls = track(new OrbitControls(camera, renderer.domElement));

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
    var texture = track(new THREE.TextureLoader().load('/img/jiantou2.png'))
    // 设置阵列模式 RepeatWrapping
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    // 设置x方向的重复数(沿着管道路径方向)
    // 设置y方向的重复数(环绕管道方向)
    texture.repeat.x = 5;
    texture.repeat.y = 5;
    // 设置管道纹理偏移数,便于对中
    texture.offset.y = 0.5;
    // 旋转贴图
    // texture.rotation = 90 * Math.PI / 180

    var tubeMaterial = new THREE.MeshPhysicalMaterial({
        map: texture,
        transparent: true,
    });

    setInterval(() => {
        texture.offset.x -= 0.0076
    })
    new FBXLoader().setPath('/models/').load('bent_pipe.fbx',
        function (object) {

            object.position.set(-240, 30, -100);
            object.scale.set(5, 5, 5)
            scene.add(object)
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = tubeMaterial
                }
            })
        }

    )


}



const animate = () => {
    animateID = requestAnimationFrame(animate);
    controls.update();

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
  