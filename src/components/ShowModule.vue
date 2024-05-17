<template>
    <transition name="dmc">
        <div class="container" v-show="showContainer">
            <div id="threeBox"></div>
            <div class="name" v-if="showName">
                {{ name }}
            </div>
            <div class="zizhuan">
                <n-checkbox v-model:checked="isRotate" @update:checked="handleCheckedChange"> </n-checkbox> 自转
            </div>
            <div class="close" @click="clickClose">
                X
            </div>
            <n-spin size="large" v-show="showLoading" class="loading" />
        </div>
    </transition>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { NCheckbox, NSpin } from 'naive-ui'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ResourceTracker from "@/utils/TrackResource.js"; //页面销毁时清理threejs的内存

let resMgr = new ResourceTracker();// 在外层定义resMgr和track
const track = resMgr.track.bind(resMgr);


var scene, camera, renderer;
var controls, isRotate = ref(true)
var animateID
var threeBox
var showName = ref(false)
var name = ref("风机壳")
const showContainer = ref(true)
const showLoading = ref(true)

function initHDR() {
    new RGBELoader()
        .setDataType(THREE.FloatType).setPath('/hdr/')
        .load('startup.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            // scene.background = hdrUrl == 'startup.hdr' ? sceneBackground : texture;
            scene.environment = track(texture);
            showLoading.value = false
        })
}

function init() {
    scene = new THREE.Scene();
    camera = track(new THREE.PerspectiveCamera(75, threeBox.clientHeight / threeBox.clientHeight, 0.1, 10000));
    camera.position.set(80, 0, 0);
    camera.target = new THREE.Vector3(0, 0, 0);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);//将渲染器的像素比率设置为设备的像素比率
    // renderer.setClearColor(0x020512, 0); //bgcolor#FFFACD
    renderer.setSize(threeBox.clientWidth, threeBox.clientHeight);
    renderer.toneMapping = THREE.CineonToneMapping; //设置色调映射算法为 电影胶片的色调
    renderer.toneMappingExposure = 1.5; //曝光
    renderer.outputcolorspace = THREE.sRGBEncoding;

    // 环境光
    const ambientLight = track(new THREE.AmbientLight(0xffffff, 2));
    scene.add(ambientLight);

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
    // var axesHelper = track(new THREE.AxesHelper(10)); // 参数指定坐标轴的长度
    // scene.add(axesHelper);
}

onMounted(() => {
    threeBox = document.getElementById('threeBox')
    init()
    initHDR()
    threeBox?.appendChild(renderer.domElement)

    animate()
})
onUnmounted(() => {
    destroyThreejs()
});



function animate() {
    animateID = requestAnimationFrame(animate);
    controls.update();

    // stats.update()

    renderer.render(scene, camera);
}
function destroyThreejs() {
    try {
        scene.clear();
        resMgr && resMgr.dispose()
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.content = null;
        cancelAnimationFrame(animateID)
        let gl = renderer.domElement.getContext("webgl");
        gl && gl.getExtension("WEBGL_lose_context").loseContext();
        // console.log(renderer.info)   //查看memery字段即可
    } catch (e) {
        console.log(e)
    }
};

function clickClose() {
    showContainer.value = false
}

// function LLshow(geometry, material) {
function LLshow(Object) {
    console.log(Object);
    showName = true;
    name = Object.name;
    showContainer.value = true;
    showLoading.value = true;
    var box = track(new THREE.Box3());
    box.expandByObject(Object);
    var center = new THREE.Vector3();
    box.getCenter(center);

    Object.translateX(-center.x);
    Object.translateY(-center.y);
    Object.translateZ(-center.z);
    var curGroup = track(new THREE.Group());
    curGroup.name = "curScene1";
    curGroup.add(Object);
    let removeModel = scene.getObjectByName('curScene1');
    if (removeModel) {
        scene.remove(removeModel);
    }

    // Object.name = 'clonedModel'

    scene.add(curGroup);
    showLoading.value = false
}


// 自转
function handleCheckedChange(checked) {
    isRotate.value = checked;
    controls.autoRotate = checked;
}

defineExpose({
    LLshow
});
</script>
<style scoped>
.container {
    position: absolute;
    color: #fff;
    width: 400px;
    height: 400px;
    top: 0;
    left: 0;
}


.dmc-enter-from {
    opacity: 0;
}

.dmc-leave-to {
    opacity: 0;
}

.dmc-enter-to {
    opacity: 1;
}

.dmc-leave-from {
    opacity: 1;
}

.dmc-enter-active {
    transition: opacity 1s ease;
}

.dmc-leave-active {
    transform: opacity 1s ease;
}


.name {
    position: absolute;
    /* border: 1px solid red; */
    font-size: 22px;
    width: 180px;
    text-align: center;
    color: aqua;
    font-family: Georgia, 'Times New Roman', Times, serif;
    top: 40px;
    right: 50%;
    transform: translateX(90px);
    user-select: none;

}

.zizhuan {
    position: absolute;
    bottom: 33px;
    right: 42px;
    user-select: none;
}

.close {
    position: absolute;
    top: 33px;
    right: 42px;
    cursor: pointer;
    font-size: 20px;
}

.loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

#threeBox {
    width: 400px;
    height: 400px;
    background-image: url('../assets/image/moduleBG.png');
    background-repeat: no-repeat;
    background-size: 90% 90%;
    background-position: center;
}
</style>
  