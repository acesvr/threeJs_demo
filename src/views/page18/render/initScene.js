import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#015478");

let axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

new RGBELoader()
  .setDataType(THREE.FloatType)
  .setPath("/hdr/")
  .load("h2.hdr", function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping; //设置材质的贴图映射方式为全景反射映射
    scene.environment = texture;
  });

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);
camera.position.set(0, 10, 30);
camera.layers.enable(1); //显示辉光层

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMappingExposure = 1;

var ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);
var directionalLight = new THREE.DirectionalLight(0xffffff, 4);
camera.add(directionalLight);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const stats = new Stats();

export { scene, renderer, camera, controls, stats };
