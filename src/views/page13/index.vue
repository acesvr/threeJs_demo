<template>
  <!-- <vue-particles id="tsparticles" :options="particlesOption" /> -->
  <div id="threeBox"></div>
  <div class="menu">
    <n-button type="primary" quaternary @click="changeLayers(1)"> 钻孔柱 </n-button>
    <n-button type="primary" quaternary @click="changeLayers(2)"> 连线 </n-button>
    <n-button type="primary" quaternary @click="changeLayers(3)"> 顶点数据生成面 </n-button>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import { NUpload, NButton, NUploadDragger, NText, NIcon, NP, useNotification } from "naive-ui";

import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { mockData, vertices, face } from "./mockData";

let threeBox, stats;
let camera, controls, scene, renderer;
let light, directionalLight;
let imgD1, imgD2, imgD3;
var rippleShader;
init();
onMounted(() => {
  threeBox = document.getElementById("threeBox");
  threeBox?.appendChild(renderer.domElement);
  renderer.setAnimationLoop(animate);
});

onUnmounted(() => {
  stats.domElement.remove();
});

function init() {
  console.log("threejs版本:", THREE.REVISION);
  initScene();

  initAssets();

  initHelper();

  initBox();
}

function initScene(params) {
  scene = new THREE.Scene();
  // scene.background = new THREE.TextureLoader().load("/Bg/modelBG.jpg");

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);
  camera.position.set(30, 10, 10);
  scene.add(camera);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMappingExposure = 1;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  initLight();
}

function initLight(params) {
  light = new THREE.AmbientLight(0x404040, 1);
  scene.add(light);
  directionalLight = new THREE.DirectionalLight(0xffffff, 5.5);
  camera.add(directionalLight);
}

function initHelper() {
  let axesHelper = new THREE.AxesHelper(1);
  scene.add(axesHelper);

  stats = new Stats();
  document.body.appendChild(stats.dom);
}

function initAssets() {
  var textureLoader = new THREE.TextureLoader();
  imgD1 = textureLoader.load("/models/DI/D1.png");
  imgD2 = textureLoader.load("/models/DI/D2.png");
  imgD3 = textureLoader.load("/models/DI/D3.jpg");
}

function initBox() {
  crateCylinder(mockData);
  createLine(mockData);
  createM(face);

  createWall();

  // loadModel();
}

function createWall() {
  const geometry = new THREE.PlaneGeometry(100, 10);
  rippleShader = {
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    vertexShader: `
precision lowp float;
precision lowp int;
${THREE.ShaderChunk.fog_pars_vertex}
varying vec2 vUv;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    ${THREE.ShaderChunk.fog_vertex}
}
`,
    fragmentShader: `
  precision lowp float;
  precision lowp int;
  uniform float time;
  uniform float opacity;
  uniform vec3 color;
  uniform float num;
  uniform float speed;
  varying vec2 vUv;
  void main() {
    vec4 fragColor = vec4(0.);
    float sin = sin((vUv.y - time * speed) * 10. * num);
    float high = 0.92;
    float medium = 0.4;
    if (sin > high) {
      fragColor = vec4(mix(vec3(.8, 1., 1.), color, (1. - sin) / (1. - high)), 1.);
    } else if(sin > medium) {
      fragColor = vec4(color, mix(1., 0., 1.-(sin - medium) / (high - medium)));
    } else {
      fragColor = vec4(color, 0.);
    }
    vec3 fade = mix(color, vec3(0., 0., 0.), vUv.y);
    fragColor = mix(fragColor, vec4(fade, 1.), 0.85);
    gl_FragColor = vec4(fragColor.rgb, fragColor.a * opacity * (1. - vUv.y));
  }
	`,
    uniforms: {
      time: {
        type: "pv2",
        value: 0,
      },
      color: {
        type: "uvs",
        value: new THREE.Color("#ff1fff"), //#00ffdd
      },
      opacity: {
        type: "pv2",
        value: 0.2,
      },
      num: {
        type: "pv2",
        value: 2,
      },
      speed: {
        type: "pv2",
        value: 0.1,
      },
    },
  };

  const material = new THREE.ShaderMaterial(rippleShader);
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
  plane.layers.set(4);
}

function loadModel(params) {
  new FBXLoader().setPath("/models/").load("bent_pipe.fbx", function (object) {
    object.scale.set(0.1, 0.1, 0.1);

    scene.add(object);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
      }
    });
  });
}
function crateCylinder(mockData) {
  mockData.forEach((params) => {
    // 创建柱组，一组为1个柱子(多段)
    let group = new THREE.Group();
    group.layers.set(1);
    group.name = params.name;
    for (let i = 0; i < params.childer.length; i++) {
      const item = params.childer[i];
      let geometry = new THREE.CylinderGeometry(0.2, 0.2, item.height, 12); //（上半径，下半径，<高度>，细分）

      // color: new THREE.Color(item.color),
      let material = new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.8 });
      material.map = item.remark == "土层" ? imgD1 : item.remark == "煤层" ? imgD2 : imgD3;
      let cylinder = new THREE.Mesh(geometry, material);
      cylinder.position.set(item.position.x, item.position.y, item.position.z);
      cylinder.name = item.name;

      group.add(cylinder);
      cylinder.layers.set(1);
    }
    scene.add(group);
  });
}

function createLine(params) {
  for (let i = 0; i < 10; i++) {
    var item = params[i];
    var nextItem = params[i + 1];
    if (!item) {
      return;
    }
    if (!nextItem) {
      nextItem = params[0];
      return;
    }
    for (let jndex = 0; jndex < item.vertex.length; jndex++) {
      const j = item.vertex[jndex];
      let [x, y, z] = item.vertex[jndex];
      let [x2, y2, z2] = nextItem.vertex[jndex];
      let points = [new THREE.Vector3(x, y, z), new THREE.Vector3(x2, y2, z2)];
      let lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      let lineMaterial = new THREE.LineBasicMaterial({ color: 0x00f5ff });
      let line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      line.layers.set(2);
    }
  }
}

function createM(params) {
  params.forEach((item) => {
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(item.data);

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    if (item.faceIndex) {
      geometry.setIndex(item.faceIndex);
    }
    geometry.computeVertexNormals();

    var material = new THREE.MeshPhysicalMaterial({ color: item.color, side: THREE.DoubleSide }); //, wireframe: true
    var plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
    plane.layers.set(3);
  });
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

var clock = new THREE.Clock();
function animate() {
  renderer.render(scene, camera);
  let delta = clock.getDelta();
  stats.update();
  rippleShader.uniforms.time.value += delta;
}

const changeLayers = (type) => {
  if (type == 1) {
    camera.layers.toggle(1);
  } else if (type == 2) {
    camera.layers.toggle(2);
  } else if (type == 3) {
    camera.layers.toggle(3);
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
