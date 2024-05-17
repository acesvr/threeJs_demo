<template>
  <!-- <vue-particles id="tsparticles" :options="particlesOption" /> -->
  <div id="threeBox"></div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { mockData, vertices, face } from "./mockData";

import Delaunator from "delaunator";
let threeBox, stats;
let camera, controls, scene, renderer;
let light, directionalLight;
let imgD1, imgD2;
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

  new RGBELoader()
    .setDataType(THREE.FloatType)
    .setPath("/hdr/")
    .load("h2.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;
    });

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);
  camera.position.set(30, 10, 10);
  scene.add(camera);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.toneMapping = THREE.CineonToneMapping; //设置色调映射算法为 电影胶片的色调
  renderer.toneMappingExposure = 1; //曝光
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  initLight();
}

function initLight(params) {
  light = new THREE.AmbientLight(0xffffff, 0);
  scene.add(light);
  directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  camera.add(directionalLight);
  // scene.add(directionalLight);
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
  imgD2 = textureLoader.load("/textures/gydj_phong2_BaseColor_ll.jpg");
}

function initBox() {
  let points3d = [
    { x: -92.578, y: -74.426, z: -5.491 },
    { x: -46.289, y: -74.426, z: -5.481 },
    { x: 6.495, y: -74.426, z: 2.375 },
    { x: 46.289, y: -74.426, z: 5.027 },
    { x: 92.578, y: -74.426, z: -5.481 },
    { x: 92.578, y: -37.213, z: 3.321 },
    { x: 46.289, y: 37.213, z: 9.628 },
    { x: 4.641, y: -37.213, z: 5.027 },
    { x: -46.289, y: -37.213, z: -4.388 },
    { x: -92.578, y: 37.213, z: 6.59 },
  ];

  const indexDelaunay = Delaunator.from(
    points3d.map((v) => {
      return [v.x, v.z];
    })
  );

  const geom = new THREE.BufferGeometry().setFromPoints(points3d);

  const uv = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
  geom.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  const meshIndex = [];
  for (let i = 0; i < indexDelaunay.triangles.length; i++) {
    meshIndex.push(indexDelaunay.triangles[i]);
  }
  geom.setIndex(meshIndex);

  geom.computeVertexNormals();

  let Mat = new THREE.MeshPhysicalMaterial({
    // color: new THREE.Color(0xff0000),
    reflectivity: 1, //反射率
    // color: new THREE.Color(0x522c09),
    side: THREE.DoubleSide,
    metalness: 0.5,
    roughness: 0.8, // 粗糙度，0表示完全光滑
    side: THREE.DoubleSide, //双面展示

    wireframe: false,
  });
  const mesh = new THREE.Mesh(geom, Mat);
  mesh.rotation.x = Math.PI / 2; // 将网格旋转90度
  scene.add(mesh); //添加到场景
  // 创建导出器
  console.log(scene);

  crateCylinder(mockData);
  // createLine(mockData);
  // createM(face);

  createWall();

  //  // loadModel();
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
  mockData.forEach((params, index) => {
    // 创建柱组，一组为1个柱子(多段)
    let group = new THREE.Group();
    group.name = params.name;
    for (let i = 0; i < params.childer.length; i++) {
      const item = params.childer[i];
      let geometry = new THREE.CylinderGeometry(0.2, 0.2, item.height, 12); //（上半径，下半径，<高度>，细分）

      let material = new THREE.MeshStandardMaterial({ color: new THREE.Color(item.color), metalness: 0.5, roughness: 0.8 });
      let cylinder = new THREE.Mesh(geometry, material);
      cylinder.position.set(item.position.x, item.position.y, item.position.z);
      cylinder.name = item.name;
      group.add(cylinder);
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
      // return;
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

    // var exporter = new GLTFExporter();
    // // 导出场景
    // exporter.parse(intersectedObject, (gltf) => {
    //   const blob = new Blob([gltf], { type: "application/octet-stream" });
    //   const a = document.createElement("a");
    //   a.href = URL.createObjectURL(blob);
    //   a.download = "scene.glb";
    //   a.click();
    // });
  }
}
window.addEventListener("click", onMouseClick, false);
// =====================Click event：end=====================

function exportGltf(model = model, type = "glb", modelAnimation = animations) {
  const exporter = new GLTFExporter();
  const options = {
    trs: true, // 是否保留位置、旋转、缩放信息
    animations: modelAnimation, // 导出的动画
    binary: type == "glb" ? true : false, // 是否以二进制格式输出
    embedImages: true, //是否嵌入贴图
    onlyVisible: true, //是否只导出可见物体
    forcePowerOfTwoTextures: true,
    includeCustomMaterials: true, //指定是否包含自定义材质
    includeCustomAttributes: true, //   指定是否包含自定义属性
    includeCustomTextures: true, // 指定是否包含自定义纹理
    includeCustomSamplers: true, // 指定是否包含自定义采样器
    includeCustomImages: true, //   指定是否包含自定义图像
    includeCustomTechniques: true, //   指定是否包含自定义技术
    includeCustomMaterialsCommon: true, //指定是否包含自定义 MaterialsCommon
    includeCustomMeshes: true, //指定是否包含自定义网格
    includeCustomSkins: true, //指定是否包含自定义皮肤
    includeCustomNodes: true, // 指定是否包含自定义节点
    includeCustomGeometries: true, //指定是否包含自定义几何体
    includeCustomPrograms: true, // 指定是否包含自定义程序
    includeCustomShaders: true, //指定是否包含自定义着色器
    includeCustomExtensions: true, //指定是否包含自定义扩展。如果设置为true，则会包含在导出中定义的自定义GLTF扩展
  };
  exporter.parse(
    model,
    function (result) {
      console.log(result);
      if (result instanceof ArrayBuffer) {
        // 将结果保存为GLB二进制文件
        saveArrayBuffer(result, `${new Date().toLocaleString()}.glb`);
      } else {
        // 将结果保存为GLTF JSON文件
        saveString(JSON.stringify(result), `${new Date().toLocaleString()}.gltf`);
      }
      function saveArrayBuffer(buffer, filename) {
        // 将二进制数据保存为文件
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        console.log("导出成功");
      }
      function saveString(text, filename) {
        // 将字符串数据保存为文件
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        console.log("导出成功");
      }
    },
    (err) => {
      console.error(err);
    },
    options
  );
}

var clock = new THREE.Clock();
function animate() {
  renderer.render(scene, camera);
  let delta = clock.getDelta();
  stats.update();
  // rippleShader.uniforms.time.value += delta;
}
</script>

<style></style>
