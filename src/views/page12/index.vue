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
import { testVertexShader } from './shader/test/vertex.js';
import { testFragmentShader } from './shader/test/fragment.js';

// import TWEEN from "@tweenjs/tween.js";
var threeContainer;
var scene;
var camera;
var renderer;
var controls;
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

    camera = track(new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000));
    camera.position.set(0, 0, 360)
    controls = track(new OrbitControls(camera, renderer.domElement));


    controls.enableZoom = true; //摄像机缩放
    // controls.enablePan = false; //摄像机平移
    controls.enableDamping = true;//启用阻尼（惯性）
    controls.screenSpacePanning = true;

    controls.maxDistance = 50000;
    controls.update();

    
    var axesHelper = new THREE.AxesHelper(110);
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
var width = window.innerWidth; // 画布的宽度
var height = window.innerHeight; // 画布的高度
var uniforms = {
    iTime: { value: 1.0 },
    iResolution: { value: new THREE.Vector2(width * 1.0, height * 1.0) },
    iMouse: { value: new THREE.Vector2(0.0, 0.0) }
}

const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    side: 2,
    uniforms: uniforms,
    
});

function initModel() {
    // var geom = new THREE.BoxGeometry(300, 300, 300);
    var geom = new THREE.PlaneGeometry(300, 200);
    // var geom = new THREE.PlaneGeometry(width, height );
    // 网格对象
    var mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);
    
}


const clock = new THREE.Clock();
const animate = () => {
    animateID = requestAnimationFrame(animate);

    let delta = clock.getDelta();
    uniforms.iTime.value += delta; // 设置着色器使用的 iTime 参数
    uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height);


    controls.update();
    // viewHelper.render(renderer);
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

/* 监听鼠标移动，并改变着色器使用的 iMouse 参数 */
// var mouseStartPosition = null; // 鼠标起始位置
// window.addEventListener("mousemove", function (event) {
//     if (!mouseStartPosition) {
//         mouseStartPosition = { x: event.clientX, y: event.clientY }
//     } else {
//         uniforms.iMouse.value.x = event.clientX - mouseStartPosition.x;
//         uniforms.iMouse.value.y = event.clientY - mouseStartPosition.y;
//     }
// })
</script>
<style scoped>
.read-the-docs {
    color: #888;
}
</style>
  