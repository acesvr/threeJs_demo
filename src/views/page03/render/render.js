import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { camera } from './camera.js'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { track, resMgr } from './track'
// 创建相机,渲染器,renderer阴影
var scene, renderer;
var sceneBackground
var controls, isRotate = ref(false)
function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);//将渲染器的像素比率设置为设备的像素比率
    // renderer.setClearColor(0x020512, 0); //bgcolor#FFFACD
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.CineonToneMapping; //设置色调映射算法为 电影胶片的色调
    renderer.toneMappingExposure = 0.8; //曝光

    // 设置背景
    // scene.background = new THREE.Color(0xffffff);
    sceneBackground = track(new THREE.TextureLoader().load('/Bg/modelBG.jpg'))
    scene.background = sceneBackground
    // 环境光
    // const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    // scene.add(ambientLight);

    // 控制器
    controls = track(new OrbitControls(camera, renderer.domElement));
    controls.autoRotate = isRotate.value; //自动围绕目标旋转。
    controls.enableZoom = true; //摄像机缩放
    controls.enablePan = false; //摄像机平移
    controls.enableDamping = true;//启用阻尼（惯性）
    controls.screenSpacePanning = true;
    controls.minDistance = 10;
    controls.maxDistance = 50000;
    controls.update();

    // 创建空间辅助坐标系
    // var axesHelper = track(new THREE.AxesHelper(200)); // 参数指定坐标轴的长度
    // scene.add(axesHelper);
}

init()






export { renderer, scene, sceneBackground, controls, isRotate }