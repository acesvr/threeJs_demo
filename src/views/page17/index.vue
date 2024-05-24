<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { scene, renderer, camera, controls, stats } from "./render/initScene";
import { NButton } from "naive-ui";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

let threeBox;
initBox();
function initBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  for (let i = 0; i < 20; i++) {
    let color = new THREE.Color();
    color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

    let material = new THREE.MeshBasicMaterial({ color: color });
    let meshBox = new THREE.Mesh(geometry, material);
    meshBox.position.x = Math.random() * 20 - 5;
    meshBox.position.y = Math.random() * 20 - 5;
    meshBox.position.z = Math.random() * 20 - 5;
    meshBox.position.normalize().multiplyScalar(Math.random() * 4.0 + 2.0);
    meshBox.scale.setScalar(Math.random() * Math.random() + 0.5);
    scene.add(meshBox);
  }
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
    const pos = new THREE.Vector3();
    intersectedObject.getWorldPosition(pos); //获取点击对象的世界坐标
    const pos2 = pos.clone().addScalar(2); //坐标++

    controls.enabled = false;
    new TWEEN.Tween({
      // 相机开始坐标
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      tx: 0,
      ty: 0,
      tz: 0,
    })
      .to(
        {
          x: pos2.x,
          y: pos2.y,
          z: pos2.z,
          tx: pos.x,
          ty: pos.y,
          tz: pos.z,
        },
        1000
      )
      .onUpdate(function (obj) {
        // 动态改变相机位置
        camera.position.set(obj.x, obj.y, obj.z);
        // 动态计算相机视线
        camera.lookAt(obj.tx, obj.ty, obj.tz);
      })
      .onComplete(function (obj) {
        controls.target.set(obj.tx, obj.ty, obj.tz);
        controls.update();
        controls.enabled = true;
      })
      .start();
  }
}
window.addEventListener("dblclick", onMouseClick, false);
// =====================Click event：end=====================

// var clock = new THREE.Clock();
function animate() {
  renderer.render(scene, camera);
  stats.update();
  TWEEN.update();
}

const changeLayers = (type) => {
  if (type || type == 0) {
    camera.layers.toggle(type);
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
    <n-button type="primary" quaternary> 双击定位模型 </n-button>
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
