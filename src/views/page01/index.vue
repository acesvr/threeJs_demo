<template>
    <ShowModule ref="moduleRef"></ShowModule>
    <LLoading v-if="showLoading" :progress="progress" />
    <div id="threeContainer"></div>
    <div class="options">
        <div class="btnItem" @click="changeRotate()">
            <img v-show="!isRotate" src="@/assets/image/rotateOFF.png" alt="">
            <img v-show="isRotate" src="@/assets/image/rotateON.png" alt="">
        </div>
        <div class="btnItem">
            <n-button @click="resetCamera()" :textColor="'#fff'">重置视角</n-button>
        </div>
        <div class="btnItem">
            <n-button @click="changeHDR()" :textColor="'#fff'">切换场景</n-button>
        </div>
        <div class="btnItem">
            <n-button @click="btnClick(1)" :textColor="'#fff'">展开</n-button>
            <n-button @click="btnClick(-1)" :textColor="'#fff'">合并</n-button>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

import { camera, resetCamera } from './render/camera'
import { hdr } from './render/loadHDR'

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
// import Stats from 'three/examples/jsm/libs/stats.module.js'
import LLoading from "@/components/LLoading.vue";
import ShowModule from "@/components/ShowModule.vue";
import { NButton } from 'naive-ui'

import ResourceTracker from "@/utils/TrackResource.js"; //页面销毁时清理threejs的内存

let resMgr = new ResourceTracker();// 在外层定义resMgr和track
const track = resMgr.track.bind(resMgr);


// 创建性能监视器
// let stats = new Stats()
// stats.setMode(0)
// stats.domElement.style.position = 'absolute'
// stats.domElement.style.left = '0px'
// stats.domElement.style.top = '0px'
// // 将监视器添加到页面中
// document.body.appendChild(stats.domElement)

// 创建相机,渲染器,renderer阴影
var scene, renderer;
const showLoading = ref(true)
var progress = ref("0"); //loading...
var mixer;// 创建动画混合器
// 材质
var phong1_material, phong2_material, phong3_material, phong4_material;
var loadingArray = []

var animateID;
var threeContainer
var hdrUrl = '/hdr/startup.hdr'

var gydjModel
var sceneBackground
var controls, isRotate = ref(false)
function changeRotate() {
    isRotate.value = !isRotate.value
    controls.autoRotate = isRotate.value;
}



init()
initMaterial()
loadMoudel()
showLoading.value = false

function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);//将渲染器的像素比率设置为设备的像素比率
    // renderer.setClearColor(0x020512, 0); //bgcolor#FFFACD
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping; //设置色调映射算法为 电影胶片的色调
    renderer.toneMappingExposure = 1; //曝光
    renderer.outputcolorspace = THREE.sRGBEncoding;
    // 设置背景
    // scene.background = new THREE.Color(0xffffff);
    sceneBackground = track(new THREE.TextureLoader().load('/Bg/modelBG.jpg'))
    scene.background = sceneBackground
    // 环境光
    // const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    // scene.add(ambientLight);

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
    // var axesHelper = track(new THREE.AxesHelper(200)); // 参数指定坐标轴的长度
    // scene.add(axesHelper);
}


/**
 * 初始化材质文件 */
function initMaterial() {
    //材质1
    loadingArray.push({ "name": "gydj_phong1_BaseColor", "isfinish": false });
    loadingArray.push({ "name": "gydj_phong1_Roughness", "isfinish": false });
    loadingArray.push({ "name": "gydj_phong1_Metallic", "isfinish": false });
    loadingArray.push({ "name": "gydj_phong1_AO", "isfinish": false });

    phong1_material = new THREE.MeshPhysicalMaterial({
        // map: new THREE.TextureLoader().load('./textures/gydj_phong1_BaseColor.jpg'),
        // metalnessMap: new THREE.TextureLoader().load('./textures/gydj_phong1_Metallic.jpg'),
        // aoMap: new THREE.TextureLoader().load('./textures/gydj_phong1_AO.jpg'),
        // roughnessMap: new THREE.TextureLoader().load('./textures/gydj_phong1_Roughness.jpg'),
        reflectivity: 1,//反射率
        color: new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
        metalness: 1,
        roughness: 1,
        // "ior": 1.52,
        // "thickness": 0.8,
        // "specularIntensity": 3,

    });
    phong1_material.map = track(new THREE.TextureLoader().load('/textures/gydj_phong1_BaseColor.jpg', loadingFinishCallBack("gydj_phong1_BaseColor")));

    phong1_material.roughnessMap = track(new THREE.TextureLoader().load('/textures/gydj_phong1_Roughness.jpg', loadingFinishCallBack("gydj_phong1_Roughness")));
    // phong1_material.roughnessMap.encoding = THREE.sRGBEncoding; //这属性像不锈钢
    phong1_material.metalnessMap = track(new THREE.TextureLoader().load('/textures/gydj_phong1_Metallic.jpg', loadingFinishCallBack("gydj_phong1_Metallic")));
    phong1_material.aoMap = track(new THREE.TextureLoader().load('/textures/gydj_phong1_AO.jpg', loadingFinishCallBack("gydj_phong1_AO"))); //环境遮挡贴图
    phong1_material.aoMapIntensity = 1;
    phong1_material.envMapIntensity = 1;


    //材质2
    loadingArray.push({ "name": "gydj_phong2_BaseColor", "isfinish": false });
    loadingArray.push({ "name": "gydj_phong2_Roughness", "isfinish": false });
    loadingArray.push({ "name": "gydj_phong2_Metallic", "isfinish": false });
    loadingArray.push({ "name": "gydj_phong2_AO", "isfinish": false });
    phong2_material = new THREE.MeshPhysicalMaterial({
        side: THREE.DoubleSide,
        roughness: 1,
        metalness: 0.5,
        reflectivity: 0.7, //反射率，由0.0到1.0。默认为0.5, 相当于折射率1.5。这模拟了非金属材质的反射率。当metalness为1.0时，此属性无效。
    });
    phong2_material.color = new THREE.Color("rgb(102,102,102)");
    phong2_material.map = track(new THREE.TextureLoader().load('/textures/gydj_phong2_BaseColor.jpg', loadingFinishCallBack("gydj_phong2_BaseColor")));
    phong2_material.roughnessMap = track(new THREE.TextureLoader().load('/textures/gydj_phong2_Roughness.jpg', loadingFinishCallBack("gydj_phong2_Roughness")));
    phong2_material.metalnessMap = track(new THREE.TextureLoader().load('/textures/gydj_phong2_Metallic.jpg', loadingFinishCallBack("gydj_phong2_Metallic")));
    phong2_material.aoMap = track(new THREE.TextureLoader().load('/textures/gydj_phong2_AO.jpg', loadingFinishCallBack("gydj_phong2_AO")));
    phong2_material.aoMapIntensity = 1;



    //材质6
    phong3_material = new THREE.MeshPhysicalMaterial({
        map: track(new THREE.TextureLoader().load('/textures/gydj_diyiban_phong3_BaseColor.jpg')),
        metalnessMap: track(new THREE.TextureLoader().load('/textures/gydj_diyiban_phong3_Metallic.jpg')),
        aoMap: track(new THREE.TextureLoader().load('/textures/gydj_diyiban_phong3_AO.jpg')),
        roughnessMap: track(new THREE.TextureLoader().load('/textures/gydj_diyiban_phong3_Roughness.jpg')),
        side: THREE.DoubleSide,
        roughness: 1,
        metalness: 0.5,
    });


    phong4_material = new THREE.MeshPhysicalMaterial({
        map: track(new THREE.TextureLoader().load('/textures/gydj_diyiban_phong4_BaseColor.jpg')),
        metalnessMap: track(new THREE.TextureLoader().load('/textures/gydj_diyiban_phong4_Metallic.jpg')),
        aoMap: track(new THREE.TextureLoader().load('/textures/gydj_diyiban_phong4_AO.jpg')),
        roughnessMap: track(new THREE.TextureLoader().load('/textures/gydj_diyiban_phong4_Roughness.jpg')),
        side: THREE.DoubleSide,
        metalness: 1, // 金属度，1表示完全金属
        roughness: 0.2, // 粗糙度，0表示完全光滑
        reflectivity: 0.7,
        color: new THREE.Color("rgb(102,102,102)"),
        aoMapIntensity: 1
        // displacementMap: new THREE.TextureLoader().load('./textures/gydj_diyiban_phong4_Height.jpg'),
        // wireframe: true,//线框
    });
}

function loadMoudel() {
    // scene.environment = track(hdr)
    // scene.background = hdr; // 将HDR立方体贴图应用为场景的背景
    // animate();
    // return
    new RGBELoader().setDataType(THREE.FloatType)
        .load('/hdr/startup.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping; //专门针对金属反射映射贴图
            // scene.background = texture; // 将HDR立方体贴图应用为场景的背景
            scene.environment = track(texture); //将HDR环境贴图应用于场景的环境。
            showLoading.value = true
            new FBXLoader().setPath('/models/').load('gydj_animation002.fbx',
                function (object) {
                    gydjModel = track(object)
                    object.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            if (child.material.name == 'phong1') {
                                child.material = phong1_material
                                child.material.name = 'phong1'
                            } else if (child.material.name == 'phong2') {
                                child.material = phong2_material
                                child.material.name = 'phong2'
                            } else if (child.material.name == 'phong6') {
                                child.material = phong3_material
                                child.material.name = 'phong6'
                            } else if (child.material.name == 'phong7') {
                                child.material = phong4_material
                                child.material.name = 'phong7'
                            }
                            if (child.name == "dianjizhou") {
                                child.material = child.material.clone();
                                child.material.metalness = 1;
                                child.material.roughness = 0.1;
                                child.material.color = new THREE.Color("rgb(255,255,255)");
                            }
                            else if (child.name == "pasted__polySurface342") {
                                child.material = child.material.clone();
                                child.material.metalness = 0.9;
                                child.material.roughness = 0.2;
                                child.material.color = new THREE.Color(0xffffff);
                            }
                            else if (child.name == "pasted__polySurface15") {
                                child.material = child.material.clone();
                                child.material.metalness = 0.9;
                                child.material.roughness = 0.2;
                                child.material.color = new THREE.Color(0xffffff);
                            }
                            else if (child.name == "L_wendubiao") {
                                child.material = child.material.clone();
                                child.material.metalness = 0.1;
                                child.material.roughness = 0.8;
                                child.material.color = new THREE.Color("rgb(255,255,255)");
                            }
                            else if (child.name == "M_wendubiao") {
                                child.material = child.material.clone();
                                child.material.metalness = 0.1;
                                child.material.roughness = 0.8;
                                child.material.color = new THREE.Color("rgb(255,255,255)");
                            }
                            else if (child.name == "R_wendubiao") {
                                child.material = child.material.clone();
                                child.material.metalness = 0.1;
                                child.material.roughness = 0.8;
                                child.material.color = new THREE.Color("rgb(255,255,255)");
                            }
                            else if (child.name == "pCylinder9") {
                                child.material = child.material.clone();
                                child.material.normalMap = null;
                                // specularIntensity: 1, //物体的镜面反射强度。
                                // child.material.specularColor.set(0x046214);//物体的镜面反射颜色
                                child.material.metalness = 0.8;// 金属度，1表示完全金属
                                child.material.roughness = 0.8; // 粗糙度，0表示完全光滑
                                child.material.color = new THREE.Color(0x1a1e1a);
                                child.material.reflectivity = 0
                            }
                            child.material.needsUpdate = true;
                        }
                    })

                    object.position.set(0, 0, 0);
                    object.name = "gydjModel";
                    mixer = new THREE.AnimationMixer(gydjModel);
                    scene.add(gydjModel);

                    showLoading.value = false
                    animate();
                }, function (xhr) {
                    progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(0);
                }
            );
        }, function (xhr) {
            // 加载进度回调函数
            progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(0);
        });
}


//加载完成
function loadingFinishCallBack(item) {
    for (var i = 0; i < loadingArray.length; i++) {
        if (loadingArray[i].name == item) {
            loadingArray[i].isfinish = true;
            break;
        }
    }
}

onMounted(() => {
    threeContainer = document.getElementById('threeContainer')
    threeContainer?.appendChild(renderer.domElement)
})
onUnmounted(() => {
    destroyThreejs()
});


// var clock = new THREE.Clock();
function animate() {
    animateID = requestAnimationFrame(animate);
    controls.update();
    // var delta = clock.getDelta();
    // mixer.update(delta);
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
        console.log(renderer.info)   //查看memery字段即可
    } catch (e) {
        console.log(e)
    }
};

// 动画
function btnClick(timeScale) {
    if (!gydjModel) {
        return
    }

    var explosionClip = THREE.AnimationClip.findByName(gydjModel.animations, 'Take 001'); //获取动画剪辑
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
        console.log('Clicked on:', intersectedObject);

        if (intersectedObject.name == "L_wendubiao" || intersectedObject.name == "M_wendubiao" || intersectedObject.name == "R_wendubiao") {
            // intersectedObject.material.color.set(0xffffff);
            // changeShowContainer()
            LLshow(intersectedObject)
        }
        if (intersectedObject.name == "pCube21") {
            intersectedObject.position.x += 1;
        }
    }
}
// =====================检测点击事件end=====================
/**切换场景 */
function changeHDR() {
    if (hdrUrl == '/hdr/startup.hdr') {
        hdrUrl = '/hdr/h1.hdr'
    } else {
        hdrUrl = '/hdr/startup.hdr'
    }

    new RGBELoader()
        .setDataType(THREE.FloatType)
        .load(hdrUrl, function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = hdrUrl == '/hdr/startup.hdr' ? sceneBackground : texture;
            scene.environment = texture;
            showLoading.value = false
        }, function (xhr) {
            // 加载进度回调函数
            progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(2);
            showLoading.value = true
        },);
}




// 窗口大小自适应
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
};



const moduleRef = ref(null);

const LLshow = (Object) => {
    moduleRef.value.LLshow(Object.clone());
};
const changeShowContainer = () => {
    moduleRef.value.changeShowContainer();
};
</script>

<style >
body {
    margin: 0;
    padding: 0;
}

.options {
    width: 180px;
    position: absolute;
    top: 10%;
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
