<template>
    <LLoading v-if="showLoading" :progress="progress" />
    <!-- <Tagline @sendTag="getTag"></Tagline> -->
    <div id="threeContainer"></div>
    <div class="options_ios_left">
        <!-- <div class="btnItem">
            <div class="btnItem_son" style="color:#8a2be2">
                拖拽：<n-switch size="small" v-model:value="isDrag" @update:value="changeIsDrag()" :rail-style="railStyle" />
            </div>
        </div>
        <div class="btnItem">
            <n-button @click="Fuwei()" color="#8a2be2" ghost size="small">部件复位</n-button>
        </div> -->
        <div class="btnItem">
            <n-button @click.stop="resetCamera()" color="#8a2be2" ghost size="small">视角复位</n-button>
        </div>
        <div class="btnItem">
            <n-button @click.stop="showTag()" color="#8a2be2" ghost size="small">显隐标签</n-button>
        </div>
        <!-- <div class="btnItem">
            <n-button @click="btnClick(1)" color="#8a2be2" ghost size="small">动画</n-button>
        </div> -->
        <!-- <div class="btnItem">
            <n-button @click="zizhuan()" color="#8a2be2" ghost size="small">自转</n-button>
        </div> -->
    </div>

    <div id="tag1"></div>
    <div id="css2DContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

import { camera, setCamera } from './render/camera'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
// import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import LLoading from "@/components/LLoading.vue";
import { NButton, NSwitch } from 'naive-ui'
import { track, resMgr } from './render/track'
import { modelList } from './render/modelInfo.js'
import TWEEN from "@tweenjs/tween.js";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { useMessage } from "naive-ui";
const message = useMessage();

const railStyle = ({
    focused,
    checked
}) => {
    const style = {};
    if (checked) {
        style.background = "#8a2be2";
        if (focused) {
            style.boxShadow = "0 0 0 2px #8a2be240";
        }
    } else {
        style.background = "#b0adb1";
        if (focused) {
            style.boxShadow = "0 0 0 2px #2080f040";
        }
    }
    return style;
}

// 创建相机,渲染器,renderer阴影
var scene, renderer;
var labelRenderer;
const showLoading = ref(true)
var progress = ref("0"); //loading...

var mixer;// 创建动画混合器
var explosionClip; //展开的动画剪辑
var explosionAction

// 材质
var animateID;
var threeContainer, css2DContainer;
var ambientLight

var controls, isRotate = ref(false)
var plane_dm;
var directionalLight;
showLoading.value = true;

var tagList = new THREE.Group();

init();
initControls();
initCSS2D();
animate();

modelList.forEach(item => {
    loadMoudel(item)
});
// loadMoudel({ fileName: 'door.fbx' });
// loadMoudel({ fileName: 'conveyor-bars-fence.fbx' });
// loadMoudel({ fileName: 'box-small.fbx' });


function init() {
    scene = new THREE.Scene();
    var loader = new THREE.CubeTextureLoader().setPath('/Bg/');
    var textureCube = loader.load([
        'posx.jpg', 'negx.jpg', // 右、左
        'posy.jpg', 'negy.jpg', // 上、下
        'posz.jpg', 'negz.jpg'  // 前、后
    ]);


    // textureCube.mapping = THREE.EquirectangularReflectionMapping; //设置材质的贴图映射方式为全景反射映射


    // 将贴图应用到场景的背景中
    scene.background = new THREE.Color(0xededed);
    scene.environment = textureCube

    // , logarithmicDepthBuffer: true 
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);//将渲染器的像素比率设置为设备的像素比率
    renderer.setClearColor(0x020512, 0); //bgcolor#FFFACD
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.CineonToneMapping; //设置色调映射算法为 电影胶片的色调
    renderer.toneMappingExposure = 2; //曝光
    renderer.shadowMap.type = THREE.VSMShadowMap; // 启用渲染器的阴影映射
    renderer.shadowMap.enabled = true; // 启用渲染器的阴影映射


    renderer.localClippingEnabled = true;
    // renderer.outputcolorspace = THREE.sRGBEncoding;




    ambientLight = new THREE.AmbientLight(0x404040, 10);
    scene.add(ambientLight);
    directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(50, 70, 100);
    // directionalLight.castShadow = true;
    scene.add(directionalLight)
    // var dHelp = new THREE.DirectionalLightHelper(directionalLight, 1)
    // scene.add(dHelp)

    // const cam = directionalLight.shadow.camera;
    // cam.near = 1;
    // cam.far = 500;
    // cam.left = -100;
    // cam.right = 100;
    // cam.top = 100;
    // cam.bottom = -100;

    // const cameraHelper = new THREE.CameraHelper(cam);
    // scene.add(cameraHelper);
    // cameraHelper.visible = true;


    // 创建空间辅助坐标系
    var axesHelper = track(new THREE.AxesHelper(200)); // 参数指定坐标轴的长度
    scene.add(axesHelper);

    // var GridHelper = track(new THREE.GridHelper(100, 100)); // 参数指定坐标轴的长度
    // scene.add(GridHelper);


    // 创建平面
    var planeGeometry = new THREE.PlaneGeometry(1000, 1000); // 设置平面的大小
    // var planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa }); // 设置平面的材质
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xededed });
    plane_dm = track(new THREE.Mesh(planeGeometry, planeMaterial)); // 创建平面对象
    plane_dm.rotation.x = -Math.PI / 2;
    plane_dm.position.y = -2;
    plane_dm.receiveShadow = true; // 设置平面接收阴影
    scene.add(plane_dm); // 将平面添加到场景中
    // 没有产生阴影的关键设置在这里
    // const gui = new GUI();
    // var guiParams = {
    //     background: '#7d678c'
    // }
    // gui.addColor(guiParams, 'background').onChange(color => {
    //     scene.background = new THREE.Color(color)
    //     plane_dm.material.color = new THREE.Color(color)
    // })
}


function initControls() {
    // 控制器
    controls = track(new OrbitControls(camera, renderer.domElement));
    controls.autoRotate = isRotate.value; //自动围绕目标旋转。
    controls.enableZoom = true; //摄像机缩放
    // controls.enablePan = false; //摄像机平移
    controls.enableDamping = true;//启用阻尼（惯性）
    controls.screenSpacePanning = true;
    controls.minDistance = 10;
    controls.maxDistance = 50000;
    controls.update();



}

function initCSS2D() {
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    labelRenderer.domElement.style.position = 'absolute';
    // 相对标签原位置位置偏移大小
    labelRenderer.domElement.style.top = '-30px';
    // //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
    labelRenderer.domElement.style.pointerEvents = 'none';
}

// 新建标签
function createLableObj(tagText, vector) {
    let laberDiv = document.createElement('div');//创建div容器
    laberDiv.className = 'laber_name';
    laberDiv.textContent = tagText;
    let pointLabel = new CSS2DObject(laberDiv);
    pointLabel.position.set(vector.x, vector.y, vector.z);
    return pointLabel;
}


function loadMoudel({ fileName, position, scale, rotation, tagText }) {
    new FBXLoader().setPath('/models/page05/').load(fileName,
        function (object) {
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.side = 2
                    // child.castShadow = true; // 投射阴影
                    // child.receiveShadow = true;
                    // child.material.side = THREE.DoubleSide
                }
            })

            if (scale) {
                object.scale.set(scale, scale, scale)
            }
            if (position) {
                object.position.set(position.x, position.y, position.z)
            }
            if (rotation) {
                // object.rotation.set({ x: rotation.x, y: rotation.y, z: rotation.z })
                // object.rotation.set({ x: rotation.x, y: rotation.y, z: rotation.z })

                object.rotation.x = rotation.x;
                object.rotation.y = rotation.y;
            }

            if (tagText) {
                let pointLabel = createLableObj(tagText, object.position);
                tagList.add(pointLabel)
                object.children.push(pointLabel)
            }

            scene.add(track(object));
            showLoading.value = false;
        }, function (xhr) {
            progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(0);
        }
    );
}



onMounted(() => {
    threeContainer = document.getElementById('threeContainer')
    threeContainer?.appendChild(renderer.domElement)

    css2DContainer = document.getElementById('css2DContainer')
    css2DContainer?.appendChild(labelRenderer.domElement)
})
onUnmounted(() => {
    destroyThreejs()
});


// var clock = new THREE.Clock();
function animate() {
    animateID = requestAnimationFrame(animate);
    controls.update();
    // let delta = clock.getDelta();
    // mixer.update(delta);

    TWEEN.update();
    renderer.render(scene, camera);
    if (labelRenderer) {
        labelRenderer.render(scene, camera); //渲染HTML标签对象
    }
    // 
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

        console.log(renderer.info.memory)//查看memery字段即可
    } catch (e) {
        console.log(e)
    }
};



// =====================检测点击事件start=====================
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
window.addEventListener('click', onMouseClick, false);
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        // 当有交点时，执行相应的操作
        var intersectedObject = intersects[0].object;
        // console.log(intersects[0].object.name);
        if (intersectedObject.name == 'box_small') {
            new TWEEN.Tween(intersectedObject.position)
                .to({ x: 0, y: 60, z: 0 }, 100) // 目标位置和持续时间
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(function () {
                    new TWEEN.Tween(intersectedObject.position)
                        .to({ x: 0, y: 0, z: 0 }, 100)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                }) // 缓动函数
                .start(); // 开始动画
        }

    }
}
// =====================检测点击事件end=====================



/*** 重置相机50, 50, 100) */
const resetCamera = () => {
    new TWEEN.Tween(camera.position)
        .to({ x: 50, y: 50, z: 100 }, 600) // 目标位置和持续时间
        .easing(TWEEN.Easing.Quadratic.InOut) // 缓动函数
        .start(); // 开始动画
    //  camera.target = new THREE.Vector3(0, 0, 0);
    // camera.position.set(-300, 0, 0);
    controls.target.set(0, 0, 0); // 将控制器的目标点设置为中心点
}
const showTag = () => {
    tagList.children.forEach(item => {
        item.visible = !item.visible
    });
}
// 窗口大小自适应
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
};

// 判断是否为PC端
function isPC() {
    var userAgentInfo = navigator.userAgent;
    var agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var i = 0; i < agents.length; i++) {
        if (userAgentInfo.indexOf(agents[i]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
</script>

<style lang="less">
body {
    margin: 0;
    padding: 0;
    // background-image: url(/Bg/qianSe.png);
    background-color: #eae6ee;
    // background-size: 100% 100%;
    overflow: hidden;

    user-select: none;
    -webkit-user-selsct: none; //Chrome、Safari 和 Opera
    -moz-user-select: none; //Firefox 
    -webkit-user-drag: none; //禁止用户拖拽
}

canvas {
    cursor: pointer;
    user-select: none;
}

.msage {
    position: absolute;
    top: 0%;
    left: 0%;
    color: #fff;
    user-select: none;
}


.options_ios_left {
    position: absolute;
    // bottom: 40px;
    bottom: 30px;
    right: 30px;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.laber_name {
    color: #fff;
    padding: 10px;
    background-color: rgba(69, 146, 228, 0.5);
}
</style>
