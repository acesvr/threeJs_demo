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
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';


const gui = new GUI();
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
    camera.position.set(0, 0, 2)


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
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    transparent: true,
    side: 2,
    uniforms: {
        uTime: { value: 0 },
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uColor: { value: new THREE.Color('orange') },
        uTexture: { value: new THREE.TextureLoader().load('/Bg/bgHDR2.jpg') }
    }
});

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('frequencyX');
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('frequencyY');

function initModel() {
    // var geometry = new THREE.PlaneGeometry(10, 10, 30, 30);


    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const count = geometry.attributes.position.count
    const randoms = new Float32Array(count)
    // 使用随机数填充数组
    for (let i = 0; i < count; i++) {
        randoms[i] = Math.random()
    }
    // 添加到几何体的属性中

    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))


    var mesh = track(new THREE.Mesh(geometry, material));
    var mesh2 = track(new THREE.Mesh(geometry, material));
    mesh.scale.y = 2 / 3;
    mesh2.scale.y = 2 / 3;

    mesh2.position.set(0,0.6,0)
    scene.add(mesh)
    scene.add(mesh2)
}


const clock = new THREE.Clock();
const animate = () => {
    animateID = requestAnimationFrame(animate);
    controls.update();
    let delta = clock.getDelta();
    if (viewHelper.animating === true) {
        viewHelper.update(delta);
    }

    let elapsedTime = clock.getElapsedTime();

    material.uniforms.uTime.value = elapsedTime;
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
  