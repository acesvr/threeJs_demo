<!-- 
  局部辉光的实现:
      将要辉光的物体  layer设为xx层
      渲染时场景循环判断，物体的layer.test(xx) == false,则是不辉光的物体，保存此物体材质，然后修改此物体材质为黑色
      渲染辉光通道：bloomComposer.render();
      将设置为黑色的材质重新设置回去
      渲染最终通道：finalComposer.render();
 -->

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { scene, renderer, camera, controls, stats } from "./render/initScene";
import { NButton } from "naive-ui";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

// 辉光效果
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { BloomShader } from "./render/BloomShader";

var bloomPass, bloomComposer, finalComposer;
var bloomLayer;
var darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const materials = {}; //不需要辉光的mesh需要设置成黑色材质，此字段暂存mesh的原来材质
let threeBox;
const BLOOM_SCENE = 1; //辉光层级
init();

function init() {
  creatBox();
  initComposer();
}

function initComposer() {
  // 辉光参数
  const params = {
    bloomStrength: 0.2, // 强度
    bloomThreshold: 0.2, // 阈值
    bloomRadius: 0.5, // 半径
  };

  bloomLayer = new THREE.Layers();
  bloomLayer.set(BLOOM_SCENE);

  const renderPass = new RenderPass(scene, camera);
  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.threshold, params.strength, params.radius);

  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(bloomPass);

  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: BloomShader.VERTEX_SHADER,
      fragmentShader: BloomShader.FRAGMENT_SHADER,
      defines: {},
    }),
    "baseTexture"
  );
  mixPass.needsSwap = true;

  finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderPass);
  finalComposer.addPass(mixPass);
}
function darkenNonBloomed(obj) {
  if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}

function creatBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  for (let i = 0; i < 20; i++) {
    let color = new THREE.Color();
    color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

    let material = new THREE.MeshBasicMaterial({ color: color });
    let meshBox = new THREE.Mesh(geometry, material);
    meshBox.position.x = Math.random() * 10 - 5;
    meshBox.position.y = Math.random() * 10 - 5;
    meshBox.position.z = Math.random() * 10 - 5;
    meshBox.position.normalize().multiplyScalar(Math.random() * 4.0 + 2.0);
    meshBox.scale.setScalar(Math.random() * Math.random() + 0.5);
    scene.add(meshBox);

    if (Math.random() < 0.25) meshBox.layers.set(BLOOM_SCENE);
  }
}

// =====================Click event：start=====================
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  raycaster.layers.enable(BLOOM_SCENE); //raycaster同样有layers概念，给raycaster添加辉光层级确保辉光物体能被拾取

  let intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    let intersectedObject = intersects[0].object;
    if (bloomLayer.test(intersectedObject.layers)) {
      intersectedObject.layers.set(0);
    } else {
      intersectedObject.layers.set(BLOOM_SCENE);
    }
  }
}
window.addEventListener("click", onMouseClick, false);
// =====================Click event：end=====================

// var clock = new THREE.Clock();
function animate() {
  scene.traverse(darkenNonBloomed);
  bloomComposer.render();
  scene.traverse(restoreMaterial);
  finalComposer.render();

  stats.update();
  TWEEN.update();
}

const changeLayers = (type) => {
  if (type || type == 0) {
    camera.layers.toggle(type);

    // 此处应该添加逻辑：点击射线(Raycaster)的层级和camera层级保持一致，以保证不显示的层级是禁止选取的
    // 代码略...
  }
};

onMounted(() => {
  threeBox = document.getElementById("threeBox");
  threeBox?.appendChild(renderer.domElement);
  renderer.setAnimationLoop(animate);

  document.body.appendChild(stats.dom);
});
onUnmounted(() => {
  stats.domElement.remove();
  destroyThreejs();
});
const destroyThreejs = () => {
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
    console.log(renderer.info);
  } catch (e) {
    console.log(e);
  }
};
</script>
<template>
  <div id="threeBox"></div>
  <div class="menu">
    <n-button type="primary" quaternary @click="changeLayers(0)"> 默认层显隐 </n-button>
    <n-button type="primary" quaternary @click="changeLayers(BLOOM_SCENE)"> 辉光层显隐 </n-button>
  </div>

  <div class="uiBox"></div>
</template>
<style lang="less">
.menu {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  border: 1px solid red;

  display: flex;
  flex-wrap: wrap;
}
</style>
