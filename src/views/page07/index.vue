<template>
    <LLoading v-if="showLoading" :progress="progress" />
    <!-- <Tagline @sendTag="getTag"></Tagline> -->
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
        <div class="btnItem" style="border:1px solid #fff;color: #fff;">
            拖拽<n-switch size="medium" v-model:value="isDrag" @update:value="changeIsDrag()" />
        </div>
        <div class="btnItem">
            <n-button @click="Fuwei()" :textColor="'#fff'">复位</n-button>
        </div>
        <div class="btnItem">
            <n-button @click="btnClick(1)" :textColor="'#fff'">展开</n-button>
            <n-button @click="btnClick(-1)" :textColor="'#fff'">合并</n-button>
        </div>
        <div class="btnItem" style="color:#fff;user-select: none;">

            <n-button v-if="zjq" @click="clipping(0)" :textColor="'#fff'">X轴切面：切面</n-button>
            <n-button v-else @click="clipping(350)" :textColor="'#fff'">X轴切面：非切面</n-button>
            <!-- <n-slider @update:value="clipping" v-model:value="llVal" :step="10" style="width: 100px;" :max="50" /> -->
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

import { camera, setCamera } from './render/camera'
import { jinshu01_material, jinshu02_material, tianliao_material } from './render/loadMaterial'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
// import Stats from 'three/examples/jsm/libs/stats.module.js'

// import * as d3 from "d3";
// import Stats from "three/examples/jsm/libs/stats.module.js";
import LLoading from "@/components/LLoading.vue";
import { NButton, NSlider, NSwitch } from 'naive-ui'
import { track, resMgr } from './render/track'
// import { DragControls } from 'three/addons/controls/DragControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
// import TWEEN from "@tweenjs/tween.js";

// 创建相机,渲染器,renderer阴影
var scene, renderer;
const showLoading = ref(true)
var progress = ref("0"); //loading...
var mixer;// 创建动画混合器
// 材质
var MeshList = [];
var animateID;
var threeContainer
var hdrUrl = 'h2.hdr'
var ambientLight
var gydjModel
var sceneBackground
var controls, isRotate = ref(false)
function changeRotate() {
    isRotate.value = !isRotate.value
    controls.autoRotate = isRotate.value;
}
var PlaneHelper

var llmap, directionalLight;
init()

loadMoudel()
var llVal = ref(0)
showLoading.value = false
var PlaneArr
const zjq = ref(false)
function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);//将渲染器的像素比率设置为设备的像素比率
    // renderer.setClearColor(0x020512, 0); //bgcolor#FFFACD
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.CineonToneMapping; //设置色调映射算法为 电影胶片的色调
    renderer.toneMappingExposure = 1; //曝光



    PlaneArr = [
        //创建一个垂直x轴的平面，方向沿着x轴负方向，沿着x轴正方向平移20,
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), 350),
        // 垂直y轴的平面
        // new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
        // 垂直z轴的平面
        // new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
    ];
    // 如果不设置为true，设置剪裁平面的模型不会被剪裁
    // renderer.clippingPlanes = PlaneArr;
    renderer.localClippingEnabled = true;


    PlaneHelper = new THREE.PlaneHelper(PlaneArr[0], 300, 0xffff00);
    PlaneHelper.visible = true
    scene.add(PlaneHelper);
    renderer.outputcolorspace = THREE.sRGBEncoding;
    // 设置背景
    // scene.background = new THREE.Color(0xffffff);
    sceneBackground = track(new THREE.TextureLoader().load('/Bg/modelBG.jpg'))
    scene.background = sceneBackground
    // 环境光
    ambientLight = new THREE.AmbientLight(0xffffff, 0);
    scene.add(ambientLight);

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


    llmap = new THREE.Object3D();
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)

    scene.add(llmap)
    scene.add(directionalLight)

    // 创建空间辅助坐标系
    //     var axesHelper = track(new THREE.AxesHelper(200)); // 参数指定坐标轴的长度
    //     scene.add(axesHelper);
}

function loadMoudel() {
    new RGBELoader().setDataType(THREE.FloatType).setPath('/hdr/')
        .load(hdrUrl, function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping; //设置材质的贴图映射方式为全景反射映射
            // scene.background = texture; // 将HDR立方体贴图应用为场景的背景
            scene.environment = track(texture); //将HDR环境贴图应用于场景的环境。
            showLoading.value = true

            new FBXLoader().setPath('/models/jzkgydj/').load('球阀02-08.fbx',
                function (object) {
                    gydjModel = track(object)
                    MeshList = []
                    object.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            // console.log(child.position);
                            child.userData.positionX = child.position.x
                            child.userData.positionY = child.position.y
                            child.userData.positionZ = child.position.z
                            MeshList.push(child)


                            if (child.material.name == 'jinshu01') {
                                child.material = jinshu01_material
                                child.material.name = 'jinshu01'
                            } else if (child.material.name == 'jinshu02') {
                                child.material = jinshu02_material
                                child.material.name = 'jinshu02'
                            } else if (child.material.name == 'tianliao') {
                                child.material = tianliao_material
                                child.material.name = 'tianliao'
                            }

                            if (child.name == 'FaGai01' || child.name == 'FaTi01' || child.name == 'DianQuan') {
                                child.material = child.material.clone()
                                child.material.clippingPlanes = PlaneArr//遍历剖切模型的全部子对象，设置剖切属性
                            }


                        }
                    })

                    object.position.set(0, 0, 0);
                    object.name = "gydjModel";
                    mixer = new THREE.AnimationMixer(gydjModel);

                    // 需要辉光的材质
                    glowMaterialList = MeshList.map(v => v.name)
                    scene.add(gydjModel);

                    showLoading.value = false
                    animate();
                    // setModelMeshDrag({ modelDrag: true })
                }, function (xhr) {
                    progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(0);
                }
            );

        }, function (xhr) {
            // 加载进度回调函数
            progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(0);
        });
}



onMounted(() => {
    threeContainer = document.getElementById('threeContainer')
    threeContainer?.appendChild(renderer.domElement)
})
onUnmounted(() => {
    destroyThreejs()
});


var clock = new THREE.Clock();


function animate() {
    animateID = requestAnimationFrame(animate);
    controls.update();
    let delta = clock.getDelta();
    mixer.update(delta);
    // stats.update()

    renderer.render(scene, camera);
}



function clipping(num) {
    if (PlaneArr[0].constant == 10) {
        PlaneArr[0].constant = 350
        zjq.value = false
    } else if (PlaneArr[0].constant == 350) {
        PlaneArr[0].constant = 10
        zjq.value = true
    }



    // PlaneHelper.visible = true
    // setTimeout(() => {
    //     PlaneHelper.visible = false
    // }, 600);

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

    var animationNames = [];
    gydjModel.animations.forEach(function (animationClip) {
        animationNames.push(animationClip.name);
    });

    var explosionClip = THREE.AnimationClip.findByName(gydjModel.animations, 'CINEMA_4D___'); //获取动画剪辑
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

        if (intersectedObject.name == "cemian_hou_0") {
            console.log(intersectedObject, "触发");
        }
    }
}
// =====================检测点击事件end=====================


// =================鼠标按下拖动模型start===================


var dragControls; //拖拽控制器
var transformControls; //平移控制器
var glowMaterialList = [];
const isDrag = ref(false)
const changeIsDrag = (value) => {
    console.log(isDrag.value);
    if (isDrag.value) {
        // 开
        setModelMeshDrag({ modelDrag: true })
    } else {
        setModelMeshDrag({ modelDrag: false })
    }


};
const setModelMeshDrag = ({ modelDrag }) => {

    var X_tuoDong = ["FaTi01", "FaTi02", "FaGai01", "FaGai02"];
    var Y_tuoDong = ['ShouBing_3', 'TianLiaoDian', 'TianLiao', "FaGan_6", "LuoSiDian", "YaGai", "LuoSi_1"];
    var Z_tuoDong = ["MiFengHuan", "MiFengHuan_1", "FaXin", "DianQuan"];

    if (dragControls) { dragControls.dispose() };   // 先把之前的拖拽信息给清除掉
    if (transformControls) { transformControls.detach(); transformControls.dispose() }

    if (modelDrag) {
        transformControls = new TransformControls(camera, renderer.domElement);
        scene.add(transformControls);

        dragControls = new DragControls(MeshList, camera, renderer.domElement);

        // 鼠标略过事件
        dragControls.addEventListener("hoveron", (e) => {

            // 让变换控件和选中的对象绑定

            // 判断是沿x还是y轴拖动
            if (e.object) {
                transformControls.attach(e.object);
                if (Y_tuoDong.includes(e.object.name)) {
                    transformControls.showX = false
                    transformControls.showZ = false
                    transformControls.showY = true
                }

                if (X_tuoDong.includes(e.object.name)) {
                    transformControls.showX = true
                    transformControls.showZ = false
                    transformControls.showY = false
                }

                if (Z_tuoDong.includes(e.object.name)) {
                    transformControls.showX = false
                    transformControls.showZ = true
                    transformControls.showY = false
                }
            }
            // this.box.setFromObject(e.object);

        });

        transformControls.addEventListener('mouseDown', () => {
            controls.enabled = false
            dragControls.enabled = false
        })
        transformControls.addEventListener('mouseUp', (e) => {

            let addNumber = 100
            if (Y_tuoDong.includes(transformControls.object.name)) {
                if (transformControls.object.position.y > transformControls.object.userData.positionY + 100) {
                    transformControls.object.position.set(
                        transformControls.object.userData.positionX,
                        transformControls.object.userData.positionY + 100,
                        transformControls.object.userData.positionZ
                    )
                } else if (transformControls.object.position.y < transformControls.object.userData.positionY) {
                    transformControls.object.position.set(
                        transformControls.object.userData.positionX,
                        transformControls.object.userData.positionY,
                        transformControls.object.userData.positionZ
                    )
                }
            } else if (X_tuoDong.includes(transformControls.object.name)) {

                if (transformControls.object.name == "FaGai01" || transformControls.object.name == "FaTi01") {
                    if (transformControls.object.position.x > transformControls.object.userData.positionX + 100) {
                        transformControls.object.position.set(
                            transformControls.object.userData.positionX + 100,
                            transformControls.object.userData.positionY,
                            transformControls.object.userData.positionZ
                        )
                    } else if (transformControls.object.position.y < transformControls.object.userData.positionX) {
                        transformControls.object.position.set(
                            transformControls.object.userData.positionX,
                            transformControls.object.userData.positionY,
                            transformControls.object.userData.positionZ
                        )
                    }
                } else {
                    console.log(transformControls.object.position.x);
                    if (transformControls.object.position.x < transformControls.object.userData.positionX - 100) {
                        transformControls.object.position.set(
                            transformControls.object.userData.positionX - 100,
                            transformControls.object.userData.positionY,
                            transformControls.object.userData.positionZ
                        )
                    } else if (transformControls.object.position.y < transformControls.object.userData.positionX + 100) {
                        transformControls.object.position.set(
                            transformControls.object.userData.positionX,
                            transformControls.object.userData.positionY,
                            transformControls.object.userData.positionZ
                        )
                    }
                }
            } else if (Z_tuoDong.includes(transformControls.object.name)) {
                if (transformControls.object.position.z > transformControls.object.userData.positionZ + 100) {
                    transformControls.object.position.set(
                        transformControls.object.userData.positionX,
                        transformControls.object.userData.positionY,
                        transformControls.object.userData.positionZ + 100
                    )
                } else if (transformControls.object.position.z < transformControls.object.userData.positionZ) {
                    transformControls.object.position.set(
                        transformControls.object.userData.positionX,
                        transformControls.object.userData.positionY,
                        transformControls.object.userData.positionZ
                    )
                }
            }

            controls.enabled = true;
            dragControls.enabled = true
        })


    }
}

// 复位
const Fuwei = () => {
    glowMaterialList.forEach((name, i) => {
        const mesh = gydjModel.getObjectByName(name)

        if (mesh.type == 'Mesh') {
            // 材质位置计算
            mesh.position.set(mesh.userData.positionX, mesh.userData.positionY, mesh.userData.positionZ)
        }
    })

}
// 模型拆分
const setModelMeshDecompose = ({ decompose }) => {
    if (glowMaterialList.length <= 1) return false
    // const modelDecomposeMove = (obj, position) => {

    //     const tween = new TWEEN.Tween(obj.position)
    //     tween.to(position, 500)
    //     tween.onUpdate(function (val) {
    //         obj.position.set(val.x || 0, val.y || 0, val.z || 0);
    //     })
    //     tween.start()
    // }
    const length = glowMaterialList.length
    const angleStep = (2 * Math.PI) / length;
    glowMaterialList.forEach((name, i) => {
        const mesh = gydjModel.getObjectByName(name)

        if (mesh.type == 'Mesh') {
            // 材质位置计算
            const angle = i * angleStep;
            const x = (decompose) * Math.cos(angle);
            const y = (decompose) * Math.sin(angle);
            const position = {
                x, y, z: 0
            }

            // mesh.position.set(mesh.userData.positionX, mesh.userData.positionY, mesh.userData.positionZ)

            // modelDecomposeMove(mesh, { x: mesh.userData.positionX, y: mesh.userData.positionY, z: mesh.userData.positionZ })


        }
    })
}


// =================鼠标按下拖动模型end======================
/**切换场景 */
function changeHDR() {
    if (hdrUrl == 'h2.hdr') {
        hdrUrl = 'h1.hdr'
    } else {
        hdrUrl = 'h2.hdr'
    }

    new RGBELoader()
        .setDataType(THREE.FloatType).setPath('/hdr/')
        .load(hdrUrl, function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = hdrUrl == 'h2.hdr' ? sceneBackground : texture;
            scene.environment = texture;
            showLoading.value = false
        }, function (xhr) {
            // 加载进度回调函数
            progress.value = ((xhr.loaded / xhr.total) * 100).toFixed(2);
            showLoading.value = true
        },);
}

/*** 重置相机*/
const resetCamera = () => {
    //  camera.target = new THREE.Vector3(0, 0, 0);
    camera.position.set(300, 0, 0);
    controls.target.set(0, 0, 0); // 将控制器的目标点设置为中心点
}



// 窗口大小自适应
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
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
