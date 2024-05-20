<template>
  <LLoading v-if="store.showLoading" :progress="progress" />
  <!-- <vue-particles id="tsparticles" :options="particlesOption" /> -->
  <div id="threeBox"></div>
  <div class="menu">
    <n-button type="primary" quaternary @click="changeLayers(1)"> 底座显隐 </n-button>
  </div>

  <div class="uiBox"></div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { scene, renderer, camera, controls, stats } from "./render/initScene";
import { NButton } from "naive-ui";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import LLoading from "@/components/LLoading.vue";

import { useStore } from "@/store";
const store = useStore();

let threeBox;
let imgD1, imgD2, imgD3;
let showObj, isRotation;
let progress = ref("0");
init();
onMounted(() => {
  threeBox = document.getElementById("threeBox");
  threeBox?.appendChild(renderer.domElement);
  renderer.setAnimationLoop(animate);

  document.body.appendChild(stats.dom);
});

onUnmounted(() => {
  stats.domElement.remove();
  disposeThreeJs();
});

function disposeThreeJs() {
  console.log("执行清理");
  try {
    renderer.setAnimationLoop();
    scene.traverse((child) => {
      if (child.material) {
        child.material.dispose();
      }
      if (child.geometry) {
        child.geometry.dispose();
      }
      child = null;
    });
    renderer.dispose();
    scene.clear();
    console.log(renderer.info); //查看memery字段即可
  } catch (e) {
    console.log(e);
  }
}

function init() {
  store.showLoading = true;
  console.log("threejs版本:", THREE.REVISION);
  initAssets();

  initBox();

  const params = {
    videoSrc: "./videos/floorV1.mp4",
    size: [15, 15],
    loop: true, // 是否循环播放
    color: "#fff",
    opacity: 0.95,
    rotationZ: 0.01,
    textureRepeat: [1, 1],
    position: [0, 0, 0],
  };
  const params2 = {
    videoSrc: "./videos/floorV2.mp4",
    size: [18, 18],
    loop: true,
    color: "#02a7ff",
    opacity: 0.95,
    rotationZ: 0.01,
    textureRepeat: [1, 1],
    position: [0, -0.6, 0],
  };

  initFooter(params);
  initFooter(params2);
}

function initAssets() {
  var textureLoader = new THREE.TextureLoader();
  imgD1 = textureLoader.load("/models/DI/D1.png");
  imgD2 = textureLoader.load("/models/DI/D2.png");
  imgD3 = textureLoader.load("/models/DI/D3.jpg");
}

function initBox() {
  loadModel();
}
function initFooter(params) {
  let video = document.createElement("video");
  video.src = params.videoSrc;
  video.loop = params.loop;
  video.muted = true;
  video.crossOrigin = "";
  video.play();
  let videoTexture = new THREE.VideoTexture(video);
  videoTexture.wrapS = THREE.RepeatWrapping;
  videoTexture.wrapT = THREE.RepeatWrapping;
  videoTexture.repeat.set(...params.textureRepeat);

  let TresPlaneGeometry = new THREE.PlaneGeometry(...params.size);
  let TresMeshStandardMaterial = new THREE.MeshStandardMaterial({
    color: params.color,
    alphaMap: videoTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: params.opacity,
    blending: THREE.AdditiveBlending,
    flatShading: true,
    depthTest: true, //是否在渲染此材质时启用深度测试。默认为 true。false会在最前
  });

  let tresMesh = new THREE.Mesh(TresPlaneGeometry, TresMeshStandardMaterial);
  tresMesh.rotation.x = Math.PI / 2;
  tresMesh.position.set(...params.position);

  tresMesh.layers.set(1);
  camera.layers.enable(1);
  // 想自转就循环修改tresMesh的 rotation.z ++
  scene.add(tresMesh);
}

function loadModel(params) {
  new FBXLoader().setPath("/models/").load(
    "球阀.fbx",
    function (object) {
      object.scale.set(0, 0, 0);
      object.position.set(0, 0, 0);

      let material = new THREE.MeshPhysicalMaterial({
        reflectivity: 1, //反射率
        color: new THREE.Color(0x666666),
        side: THREE.DoubleSide,
        metalness: 0.8,
        roughness: 0.3, // 粗糙度，0表示完全光滑
        transparent: true,
        opacity: 1,
      });

      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = material;
          child.material.needUpdata = true;
        }
      });
      showObj = object;
      scene.add(object);
      new TWEEN.Tween(object.scale).to({ x: 0.05, y: 0.05, z: 0.05 }, 1100).easing(TWEEN.Easing.Quadratic.InOut).start();
      new TWEEN.Tween(object.position).to({ x: 0, y: 5, z: 0 }, 500).start();

      isRotation = true;
    },
    (xhr) => {
      progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(0);
      store.showLoading = false;
    }
  );
}

// =====================Click event：start=====================
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    var intersectedObject = intersects[0].object;
    console.log("Clicked on:", intersectedObject);
  }
}
window.addEventListener("click", onMouseClick, false);
// =====================Click event：end=====================

// var clock = new THREE.Clock();
function animate() {
  renderer.render(scene, camera);
  // let delta = clock.getDelta();

  if (isRotation) {
    showObj.rotation.y += 0.01;
  }
  stats.update();
  TWEEN.update();
}

const changeLayers = (type) => {
  if (type == 1) {
    camera.layers.toggle(1);
  }
};
</script>

<style lang="less">
.menu {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  border: 1px solid red;

  display: flex;
  flex-wrap: wrap;

  // pointer-events: none;
}
</style>
