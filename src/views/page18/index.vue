<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { scene, renderer, camera, controls, stats } from "./render/initScene";
import { NButton } from "naive-ui";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

let threeBox;

init();
function init(params) {
  var uniforms = {
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    iTime: {
      type: "f",
      value: 1.0,
    },
    iResolution: {
      type: "v2",
      value: new THREE.Vector2(),
    },
    iMouse: {
      type: "v2",
      value: new THREE.Vector2(),
    },
  };
  var geometry = new THREE.PlaneBufferGeometry(2, 2);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
  });

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
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
    let intersectedObject = intersects[0].object;
  }
}
window.addEventListener("click", onMouseClick, false);
// =====================Click event：end=====================

// var clock = new THREE.Clock();
function animate() {
  renderer.render(scene, camera);
  stats.update();
  TWEEN.update();
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
</script>
<template>
  <div id="threeBox"></div>
  <div class="menu">
    <n-button type="primary" quaternary> three </n-button>
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
