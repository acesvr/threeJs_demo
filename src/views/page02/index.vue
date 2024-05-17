<template>
  <LLoading v-if="showLoading" :progress="progress" />
  <div id="threeContainer"></div>
  <div class="options">
    <div class="btnItem" @click="changeRotate()">
      <img v-show="!isRotate" src="@/assets/image/rotateOFF.png" alt="" />
      <img v-show="isRotate" src="@/assets/image/rotateON.png" alt="" />
    </div>
    <div class="btnItem">
      <n-button @click="resetCamera()" :textColor="'#fff'">重置视角</n-button>
    </div>
    <div class="btnItem">
      <n-button @click="changeHDR()" :textColor="'#fff'">切换场景</n-button>
    </div>
    <div class="btnItem" style="border: 1px solid #fff; color: #fff">拖拽<n-switch size="medium" v-model:value="isDrag" @update:value="changeIsDrag()" /></div>
    <div class="btnItem">
      <n-button @click="Fuwei()" :textColor="'#fff'">复位</n-button>
    </div>
    <div class="btnItem">
      <n-button @click="btnClick(1)" :textColor="'#fff'">展开</n-button>
      <n-button @click="btnClick(-1)" :textColor="'#fff'">合并</n-button>
    </div>
    <div class="btnItem" style="width: 100px; color: #fff; user-select: none">
      <n-slider v-model:value="CTvalue" :step="10" @update:value="updateCT()" @dragend="dragendCT()" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

import { camera, setCamera, setCameraByTween } from "./render/camera";
import { jinshu01_material, jinshu02_material, tianliao_material } from "./render/loadMaterial";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
// import Stats from 'three/examples/jsm/libs/stats.module.js'

// import * as d3 from "d3";
import Stats from "three/examples/jsm/libs/stats.module.js";
import LLoading from "@/components/LLoading.vue";
import { NButton, NSlider, NSwitch } from "naive-ui";
import { track, resMgr } from "./render/track";
import TWEEN from "@tweenjs/tween.js";
import { useMessage } from "naive-ui";
import OctreeCSG from "../../utils/OctreeCSG/OctreeCSG";
const message = useMessage();
var threeContainer; // 渲染容器
var scene, renderer, sceneBackground; // 场景，渲染器，背景图
var progress = ref("0"),
  showLoading = ref(true); // loading...
var yellowBox, subtractGroup, intersectGroup; // 布尔计算实现剖切填充
var controls,
  isRotate = ref(false); // 控制器
var CTvalue = ref(50);
var ambientLight, directionalLight; // 灯光
var stats;
const updateCT = () => {
  yellowBox.visible = true;
  yellowBox.position.x = CTvalue.value;
  // console.log(DZmodel);
};

const dragendCT = () => {
  yellowBox.visible = false;

  clearGroup(subtractGroup);
  clearGroup(intersectGroup);
  DZmodelCT();
};

var mixer; // 创建动画混合器
// 材质
var MeshList = [];
var animateID;
var hdrUrl = "h2.hdr";
var DZmodel;

function changeRotate() {
  isRotate.value = !isRotate.value;
  controls.autoRotate = isRotate.value;
}
var clock = new THREE.Clock();

init();
loadMoudel();

showLoading.value = false;

function init() {
  scene = new THREE.Scene();
  sceneBackground = track(new THREE.TextureLoader().load("/Bg/modelBG.jpg"));
  scene.background = sceneBackground;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x020512, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.CineonToneMapping;
  renderer.toneMappingExposure = 0; //曝光

  subtractGroup = new THREE.Group();
  intersectGroup = new THREE.Group();
  scene.add(subtractGroup, intersectGroup);

  // 控制器
  controls = track(new OrbitControls(camera, renderer.domElement));
  controls.autoRotate = isRotate.value; //自动围绕目标旋转。
  controls.enableZoom = true; //摄像机缩放
  // controls.enablePan = false; //摄像机平移
  controls.enableDamping = true; //启用阻尼（惯性）
  controls.screenSpacePanning = true;
  controls.minDistance = 10;
  controls.maxDistance = 50000;
  controls.update();

  // 光线
  ambientLight = new THREE.AmbientLight(0xffffff, 1);
  directionalLight = new THREE.DirectionalLight(0xffffff, 5.5);
  directionalLight.position.set(300, 0, 0);

  scene.add(ambientLight, directionalLight);

  controls.addEventListener("change", function () {
    let { x, y, z } = camera.position;
    directionalLight.position.set(x, y, z);
  });

  // 创建空间辅助坐标系
  var axesHelper = track(new THREE.AxesHelper(200)); // 参数指定坐标轴的长度
  scene.add(axesHelper);

  const geometry = new THREE.BufferGeometry();
  // 创建一个简单的矩形. 在这里我们左上和右下顶点被复制了两次。
  // 因为在两个三角面片里，这两个顶点都需要被用到。
  const vertices = new Float32Array([
    -25.851, -38.75, -64.148, 25.851, -38.75, -64.148, 25.851, 38.75, -64.148, -25.851, 38.75, -64.148, -25.851, -38.75, 0, 25.851, -38.75, 0, 25.851, 38.75, 0, -25.851, 38.75, 0,
  ]);
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  // 定义立方体的面
  var indices = new Uint32Array([
    0,
    1,
    2, // 前面
    0,
    2,
    3,
    1,
    5,
    6, // 右面
    1,
    6,
    2,
    5,
    4,
    7, // 后面
    5,
    7,
    6,
    4,
    0,
    3, // 左面
    4,
    3,
    7,
    3,
    2,
    6, // 上面
    3,
    6,
    7,
    4,
    5,
    1, // 底面
    4,
    1,
    0,
  ]);
  geometry.setIndex(new THREE.BufferAttribute(indices, 1)); // 将面的索引添加到geometry中

  // 计算法线
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 1, wireframe: true }); //, wireframe: true
  const mesh = new THREE.Mesh(geometry, material);

  mesh.material.side = 2;
  mesh.scale.set(2, 2, 2);
  mesh.position.set(10, 200, 10);
  scene.add(mesh);
}

function loadMoudel() {
  yellowBox = new THREE.Mesh(new THREE.BoxGeometry(100, 300, 200), new THREE.MeshLambertMaterial({ color: 0xffff00, transparent: true, opacity: 0.1, side: 2 }));
  yellowBox.position.set(60, 0, 0);
  yellowBox.visible = false;
  scene.add(yellowBox);
  CTvalue.value = yellowBox.position.x;

  new RGBELoader()
    .setDataType(THREE.FloatType)
    .setPath("/hdr/")
    .load(
      hdrUrl,
      function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = track(texture);
        showLoading.value = true;

        new FBXLoader().setPath("/models/DI/").load(
          "dz.FBX",
          function (object) {
            DZmodel = track(object);
            MeshList = [];
            object.traverse(function (child) {
              if (child instanceof THREE.Mesh) {
                child.material.side = 2;

                // console.log(child.position);
                child.userData.positionX = child.position.x;
                child.userData.positionY = child.position.y;
                child.userData.positionZ = child.position.z;
                MeshList.push(child);

                if (child.material.name == "D1" || child.material.name == "D2" || child.material.name == "D3") {
                  // child.position.y += 50
                  child.material = child.material.clone();
                }
              }
            });

            object.name = "DZmodel";
            mixer = new THREE.AnimationMixer(DZmodel);

            // 需要辉光的材质
            glowMaterialList = MeshList.map((v) => v.name);
            // scene.add(DZmodel);
            DZmodelCT();
            showLoading.value = false;
            animate();
            // 进入动画

            new TWEEN.Tween(camera.position)
              .to({ x: 300, y: 200, z: 200 }, 1000)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {})
              .start();
            new TWEEN.Tween({ exposure: 0.3 })
              .to({ exposure: 1 }, 2000) // 动画目标位置和持续时间
              .easing(TWEEN.Easing.Quadratic.InOut) // 缓动函数
              .onUpdate((e) => {
                renderer.toneMappingExposure = e.exposure;
              })
              .start(); // 启动Tween动画
          },
          function (xhr) {
            progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(0);
          }
        );
      },
      function (xhr) {
        // 加载进度回调函数
        progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(0);
      }
    );
}

onMounted(() => {
  threeContainer = document.getElementById("threeContainer");
  threeContainer?.appendChild(renderer.domElement);

  initStats();
});
onUnmounted(() => {
  setCamera(300, 0, 0);
  destroyThreejs();
});

function initStats(params) {
  stats = new Stats();

  // 设置监视器面板，传入面板id（0: fps, 1: ms, 2: mb）
  stats.setMode(0);
  // 设置监视器位置
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0px";
  stats.domElement.style.top = "0px";

  // 将监视器添加到页面中
  document.body.appendChild(stats.domElement);
}

function animate() {
  animateID = requestAnimationFrame(animate);
  controls.update();
  // let delta = clock.getDelta();
  // mixer.update(delta);
  stats.update();
  TWEEN.update();
  renderer.render(scene, camera);
}

function destroyThreejs() {
  try {
    scene.clear();
    resMgr && resMgr.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.content = null;
    cancelAnimationFrame(animateID);
    let gl = renderer.domElement.getContext("webgl");
    gl && gl.getExtension("WEBGL_lose_context").loseContext();
    console.log(renderer.info); //查看memery字段即可
  } catch (e) {
    console.log(e);
  }
}

// 动画
function btnClick(timeScale) {
  if (!DZmodel || DZmodel.animations.length == 0) {
    message.info("无模型或无动画", { duration: 2000 });
    return;
  }
  var animationNames = [];
  DZmodel.animations.forEach(function (animationClip) {
    animationNames.push(animationClip.name);
  });

  var explosionClip = THREE.AnimationClip.findByName(DZmodel.animations, "CINEMA_4D___"); //获取动画剪辑
  var explosionAction = mixer.clipAction(explosionClip); // 创建动画动作
  explosionAction.repetitions = 1; // 执行次数
  if (timeScale == -1) {
    explosionAction.timeScale = -1; // 设置动画倒放
  } else {
    explosionAction.timeScale = 1;
    explosionAction.clampWhenFinished = true; // 播放完毕后暂停，保持拆解状态
  }
  explosionAction.reset().play();
}

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
// =====================检测点击事件start=====================

window.addEventListener("click", onMouseClick, false);
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
// =====================检测点击事件end=====================

// =================鼠标按下拖动模型start===================
var glowMaterialList = [];
const isDrag = ref(false);
const changeIsDrag = (value) => {
  if (isDrag.value) {
    // 开
    setModelMeshDrag({ modelDrag: true });
  } else {
    setModelMeshDrag({ modelDrag: false });
  }
};
const setModelMeshDrag = ({ modelDrag }) => {};

// 复位
const Fuwei = () => {
  glowMaterialList.forEach((name, i) => {
    const mesh = DZmodel.getObjectByName(name);

    if (mesh.type == "Mesh") {
      // 材质位置计算
      mesh.position.set(mesh.userData.positionX, mesh.userData.positionY, mesh.userData.positionZ);
    }
  });
};

// =================鼠标按下拖动模型end======================
/**切换场景 */
function changeHDR() {
  hdrUrl = hdrUrl == "h2.hdr" ? "h1.hdr" : "h2.hdr";

  new RGBELoader()
    .setDataType(THREE.FloatType)
    .setPath("/hdr/")
    .load(
      hdrUrl,
      function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = hdrUrl == "h2.hdr" ? sceneBackground : texture;
        scene.environment = texture;
        showLoading.value = false;
      },
      function (xhr) {
        progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(2);
        showLoading.value = true;
      }
    );
}

/*** 重置相机*/
const resetCamera = () => {
  controls.target.set(0, 0, 0); // 将控制器的目标点设置为中心点
  setCameraByTween(300, 0, 0);
};

// 窗口大小自适应
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
}

/**
 * @description: 构造立体几何
 * @param {THREE.Mesh} mesh1
 * @param {THREE.Mesh} mesh2
 * @param {csgOperationsType} operation "union" | "subtract" | "intersect"
 * @return {THREE.BufferGeometry}
 */
function ConstructiveSolidGeometry(mesh1, mesh2, operation) {
  const mesh1Octree = OctreeCSG.fromMesh(mesh1);
  const mesh2Octree = OctreeCSG.fromMesh(mesh2);
  const resultOctree = OctreeCSG[operation](mesh1Octree.clone(), mesh2Octree.clone(), false);
  const resultGeom = OctreeCSG.toGeometry(resultOctree);
  return resultGeom;
}

// 清空group下的mesh
function clearGroup(group) {
  while (group.children.length > 0) {
    var child = group.children[0];
    group.remove(child);
    // 释放子对象的资源
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      child.material.dispose();
    }
  }
}

function DZmodelCT(params) {
  DZmodel.children.forEach((item) => {
    // console.log(item);

    let subtractMesh = new THREE.Mesh(ConstructiveSolidGeometry(item, yellowBox, "subtract"), item.material.clone());
    subtractGroup.add(subtractMesh);

    let intersectMesh = new THREE.Mesh(ConstructiveSolidGeometry(item, yellowBox, "intersect"), item.material.clone());
    intersectMesh.material.transparent = true;
    intersectMesh.material.opacity = 0.1;
    intersectGroup.add(intersectMesh);
  });
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

.options {
  width: 180px;
  position: absolute;
  bottom: 10%;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  text-align: center;

  /* transform: translate(0, -50%); */
}

.btnItem {
  /* width: 80px; */
  display: flex;
  gap: 20px;
}

.btnItem img {
  width: 80px;
  cursor: pointer;
  -webkit-user-drag: none;
  user-select: none;
}
</style>
