<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { scene, renderer, camera, controls, stats } from "./render/initScene";
import { NButton } from "naive-ui";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { testVertexShader as testVertexShader, testFragmentShader as testFragmentShader } from "./shader/shader1.js";
import { testVertexShader as testVertexShader2, testFragmentShader as testFragmentShader2 } from "./shader/shader2.js";
import { testVertexShader as testVertexShader3, testFragmentShader as testFragmentShader3 } from "./shader/shader3.js";

let threeBox;
var width = window.innerWidth; // 画布的宽度
var height = window.innerHeight; // 画布的高度
var uniforms = {
  iTime: { value: 1 },
  // iResolution: { value: new THREE.Vector3(width * 1.0, height * 1.0, 1) },
  iResolution: { value: new THREE.Vector2() },
};

var plan;

var shaderArr = {
  shadertoy1: null,
  shadertoy2: null,
  shadertoy3: null,
};

init();

function init(params) {
  var geometry = new THREE.PlaneGeometry(40, 40); //面
  // var geometry = new THREE.SphereGeometry(15, 32, 16);//球
  shaderArr.shadertoy1 = new THREE.ShaderMaterial({
    name: "shader1",
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    transparent: true,
    uniforms,
    side: 2,
  });

  shaderArr.shadertoy2 = new THREE.ShaderMaterial({
    name: "shader2",
    vertexShader: testVertexShader2,
    fragmentShader: testFragmentShader2,
    transparent: true,
    uniforms,
    side: 2,
  });
  shaderArr.shadertoy3 = new THREE.ShaderMaterial({
    name: "shader3",
    vertexShader: testVertexShader3,
    fragmentShader: testFragmentShader3,
    transparent: true,
    uniforms,
    side: 2,
  });

  plan = new THREE.Mesh(geometry, shaderArr.shadertoy2);
  scene.add(plan);
}

// =====================Click event：start=====================
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    let clickObject = intersects[0].object;
    console.log("点击", clickObject);
  }
}
window.addEventListener("click", onMouseClick, false);
// =====================Click event：end=====================

// var clock = new THREE.Clock();
function animate() {
  renderer.render(scene, camera);
  stats.update();
  TWEEN.update();

  uniforms.iTime.value += 0.01;
}

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

function changeM() {
  if (plan.material.name == "shader1") {
    plan.material = shaderArr.shadertoy2;
  } else if (plan.material.name == "shader2") {
    plan.material = shaderArr.shadertoy3;
  } else if (plan.material.name == "shader3") {
    plan.material = shaderArr.shadertoy1;
  }
}
</script>
<template>
  <div id="threeBox"></div>
  <div class="menu">
    <n-button type="primary" @click="changeM()"> shader切换 </n-button>
  </div>

  <div class="uiBox"></div>
</template>
<style lang="less">
.menu {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;

  display: flex;
  flex-wrap: wrap;
}
</style>
