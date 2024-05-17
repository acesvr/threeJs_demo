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
        <div class="btnItem">
            <n-button @click="btnClick(1)" :textColor="'#fff'">展开</n-button>
            <n-button @click="btnClick(-1)" :textColor="'#fff'">合并</n-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import axios from 'axios';
import { camera, setCamera } from './render/camera'
import { buxiugang_material, qimian01_material, suliao_material } from './render/loadMaterial'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
// import Stats from 'three/examples/jsm/libs/stats.module.js'

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
// import * as dat from 'dat.gui';

import LLoading from "@/components/LLoading.vue";
import { NButton } from 'naive-ui'
import { track, resMgr } from './render/track'

const gui = new GUI()
// const gui = new dat.GUI({}) //创建GUI实例

var materials = [];// 材质组

var guiParamsArr = []; //配置信息 -------  重要 ！需要保存!!!!
var guiParams = {
    showHelp: false,
    fog: true,
};
// import Tagline from './render/oneLineTag.vue'
// import { composer } from './render/glow'
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
var axesHelper;

var animateID;
var threeContainer
var hdrUrl = 'startup.hdr'
var ambientLight
var gydjModel
var sceneBackground
var controls, isRotate = ref(false)
function changeRotate() {
    isRotate.value = !isRotate.value
    controls.autoRotate = isRotate.value;
}
const mapResObj = reactive({})


init()
loadMoudel()
showLoading.value = false



function initGui() {
    var folder0 = gui.addFolder('场景'); // 创建一个名为 'qimian01材质' 的分组
    folder0.add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    }).name('色调映射').onChange(function (value) {
        renderer.toneMapping = value;
    });

    folder0.add(renderer, 'toneMappingExposure', 0, 4.0).name('曝光 toneMappingExposure');
    folder0.add(ambientLight, 'intensity', 0, 5.0).name('环境光 intensity');
    folder0.addColor(ambientLight, 'color').name('环境光颜色')
        .onChange(function (value) {
            ambientLight.color = value

        });
    folder0.add(guiParams, 'showHelp').name('辅助线')
        .onChange(function (value) {
            if (value) {
                scene.add(axesHelper)
            } else {
                scene.remove(axesHelper)
            }


        });
    var folder1 = gui.addFolder('模型材质'); // 创建一个名为 'qimian01材质' 的分组
    guiParamsArr = []
    for (let i = 0; i < materials.length; i++) {
        let tempFolder = folder1.addFolder(materials[i].name + '材质');
        guiParamsArr.push({
            materialType: materials[i].userData.materialType, //材质类型
            name: materials[i].name,

            // ---------Mesh Physical-------  控制项
            Folder_MeshPhysicalParams: {
                id: i,
                name: 'MeshPhysical', // 物理网格材质  提供了更高级的基于物理的渲染属性
                color: materials[i].color,
                map: materials[i].map || null,
                aoMap: materials[i].aoMap || null,
                roughness: materials[i].roughness || 1,
                metalness: materials[i].metalness || 0.5,
                clearcoat: materials[i].clearcoat || 0,
                clearcoatRoughness: materials[i].clearcoatRoughness || 0,
                ior: materials[i].ior || 1.5,
                reflectivity: materials[i].reflectivity || 0.5,
            },
            // ---------Mesh Matcap -------控制项
            Folder_MeshMatcapParams: {
                name: 'MeshMatcap', //编码了材质的颜色与明暗，不对灯光作出反应，会投射阴影到一个接受阴影的物体上，但不会产生自身阴影或是接受阴影。
                color: materials[i].color,
                map: materials[i].map || null,
            },

            // ---------Mesh Phong -------控制项
            Folder_MeshPhongParams: {
                name: 'MeshPhong', //Phong网格材质   一种用于具有镜面高光的光泽表面的材质。
                color: materials[i].color,
                map: materials[i].map || null,
                aoMap: materials[i].aoMap || null,
                emissive: materials[i].emissive || new THREE.Color(0, 0, 0), //材质的放射（光）颜色
                emissiveIntensity: materials[i].emissiveIntensity || 1, //材质的放射（光）颜色
                shininess: materials[i].shininess || 30, //材质的放射（光）颜色
                reflectivity: materials[i].reflectivity || 0.5,
            },

            Folder_MeshStandardParams: {
                name: 'MeshStandard', //标准网格材质   一种用于具有镜面高光的光泽表面的材质。
                color: materials[i].color,
                map: materials[i].map || null,
                aoMap: materials[i].aoMap || null,

                roughness: materials[i].roughness || 1,
                metalness: materials[i].metalness || 0.5,

                reflectivity: materials[i].reflectivity || 0.5,
                emissive: materials[i].emissive || new THREE.Color(0, 0, 0), //材质的放射（光）颜色
                emissiveIntensity: materials[i].emissiveIntensity || 1, //材质的放射（光）强度

                flatShading: false,//定义材质是否使用平面着色进行渲染。默认值为false。
                // shininess: materials[i].shininess || 30, //越大越亮
                // reflectivity: materials[i].reflectivity || 0.5,
            },


            color: materials[i].color,


            opacity: materials[i].opacity || null,
            side: materials[i].side,
        })


        tempFolder.add(guiParamsArr[i], 'opacity', 0, 1).name('透明度')
            .onChange(function (value) {
                materials[i].opacity = value;
            })

        tempFolder.add(guiParamsArr[i], 'side', {
            Front: THREE.FrontSide,
            Back: THREE.BackSide,
            Double: THREE.DoubleSide
        }).name('渲染面').onChange(function (value) {
            materials[i].side = value
            materials[i].needsUpdate = true;
        });

        tempFolder.add(guiParamsArr[i], 'materialType', {
            MeshPhysical: 'MeshPhysicalMaterial',  //物理网格材质
            MeshMatcap: 'MeshMatcapMaterial',
            MeshNormal: 'MeshNormalMaterial',  //法线网格材质
            MeshStandard: 'MeshStandardMaterial', //标准网格材质
            // MeshPhong: "MeshPhongMaterial",
        }).name('材质类型')
            .onChange(function (value) {
                hideAll(i)
                switch (value) {
                    case 'MeshPhysicalMaterial':
                        materials[i] = new THREE.MeshPhysicalMaterial({
                            name: materials[i].name,
                            side: materials[i].side,
                            opacity: materials[i].opacity,

                            color: materials[i].color || guiParamsArr[i].Folder_MeshPhysicalParams.color || null,
                            map: guiParamsArr[i].Folder_MeshPhysicalParams.map ? track(new THREE.TextureLoader().load(guiParamsArr[i].Folder_MeshPhysicalParams.map)) : null,
                            aoMap: guiParamsArr[i].Folder_MeshPhysicalParams.aoMap ? track(new THREE.TextureLoader().load(guiParamsArr[i].Folder_MeshPhysicalParams.aoMap)) : null,
                            roughness: materials[i].roughness || guiParamsArr[i].Folder_MeshPhysicalParams.roughness,

                            // aoMap: guiParamsArr[i].Folder_MeshPhysicalParams.aoMap || null,
                            // track(new THREE.TextureLoader().load(value));
                        })
                        add_MeshPhysical(tempFolder, i)
                        break;
                    case 'MeshStandardMaterial':
                        materials[i] = new THREE.MeshStandardMaterial({
                            name: materials[i].name,
                            color: materials[i].color || null,
                            map: materials[i].map || null,
                            // aoMap: materials[i].aoMap,
                            // side: materials[i].side,
                        })

                        add_MeshStandard(tempFolder, i)
                        break;
                    case 'MeshMatcapMaterial':
                        materials[i] = new THREE.MeshMatcapMaterial({
                            name: materials[i].name,
                            opacity: materials[i].opacity,
                            side: materials[i].side,
                            color: guiParamsArr[i].Folder_MeshMatcapParams.color || null,
                            map: guiParamsArr[i].Folder_MeshMatcapParams.map ? track(new THREE.TextureLoader().load(guiParamsArr[i].Folder_MeshMatcapParams.map)) : null,
                        })
                        add_MeshMatcap(tempFolder, i)
                        break;
                    case 'MeshPhongMaterial':
                        materials[i] = new THREE.MeshPhongMaterial({
                            name: materials[i].name,
                            opacity: materials[i].opacity,
                            side: materials[i].side,
                            color: guiParamsArr[i].Folder_MeshPhongParams.color || null,
                            map: guiParamsArr[i].Folder_MeshPhongParams.map ? track(new THREE.TextureLoader().load(guiParamsArr[i].Folder_MeshPhongParams.map)) : null,
                            aoMap: guiParamsArr[i].Folder_MeshPhongParams.aoMap ? track(new THREE.TextureLoader().load(guiParamsArr[i].Folder_MeshPhongParams.aoMap)) : null,

                        })

                        add_MeshPhong(tempFolder, i)
                        break;
                    case 'MeshNormalMaterial':
                        materials[i] = new THREE.MeshNormalMaterial({
                            name: materials[i].name,
                            opacity: materials[i].opacity,
                            side: materials[i].side,
                        })
                        break;

                    default:
                        break;
                }


                materials[i].userData.materialType = value
                gydjModel.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.material.name == materials[i].name) {
                            child.material = materials[i];
                            child.material.transparent = true;
                            child.material.needsUpdate = true;
                        }
                    }
                })
                // materials[i].needsUpdate = true;
                // materials[i].side = value
            });
        if (materials[i].userData.materialType == 'MeshPhysicalMaterial') {
            add_MeshPhysical(tempFolder, i)
        } else if (materials[i].userData.materialType == 'MeshMatcapMaterial') {
            add_MeshMatcap(tempFolder, i)
        }
    }




    // var folder1 = gui.addFolder('qimian01材质'); // 创建一个名为 'qimian01材质' 的分组
    // folder1.addColor(qimian01_material, 'color').name('颜色 color')
    //     .onChange(function (value) {
    //         qimian01_material.color.set(value);
    //     });

    // folder1.add(guiParams, 'transparent').name('是否透明 transparent')
    //     .onChange(function (value) {
    //         qimian01_material.transparent = value;
    //     });
    // // folder1.addColor(qimian01_material, 'transparent').name(', 0, 1');
    // folder1.add(qimian01_material, 'opacity', 0, 1).name('透明度 opacity');

    // folder1.add(qimian01_material, 'metalness', 0, 1).name('金属度 metalness');

    // folder1.add(qimian01_material, 'roughness', 0, 1).name('粗糙度 roughness');

    // folder1.add(guiParams, 'fog', 1.0, 2.333).name('是否受雾影响 fog')
    //     .onChange(function (value) {
    //         console.log(qimian01_material.fog);
    //         qimian01_material.fog = value;
    //     });


    // folder1.add(qimian01_material, 'ior', 1.0, 2.333).name('折射率 ior');
    // folder1.add(qimian01_material, 'reflectivity', 0, 1).name('反射率 reflectivity');
    // folder1.add(qimian01_material, 'clearcoat', 0, 1).name('clear coat强度');
    // folder1.add(qimian01_material, 'clearcoatRoughness', 0, 1).name('clear coat粗糙度');
    // folder1.add(qimian01_material, 'sheen', 0, 1).name('光泽层强度 sheen');
    // folder1.add(qimian01_material, 'sheenRoughness', 0, 1).name('光泽层粗糙度');
    // folder1.addColor(qimian01_material, 'sheenColor', 0, 1).name('光泽层颜色 sheenColor').onChange(function (value) {
    //     qimian01_material.sheenColor = value;
    // });;
}

const hideAll = (i) => {
    if (guiParamsArr[i].Folder_MeshPhysical) {
        guiParamsArr[i].Folder_MeshPhysical.hide()
    }
    if (guiParamsArr[i].Folder_MeshMatcap) {
        guiParamsArr[i].Folder_MeshMatcap.hide()
    }
    if (guiParamsArr[i].Folder_MeshPhong) {
        guiParamsArr[i].Folder_MeshPhong.hide()
    }
}

function add_MeshPhysical(tempFolder, i) {
    if (guiParamsArr[i].Folder_MeshPhysical) {
        guiParamsArr[i].Folder_MeshPhysical.show()
    } else {
        guiParamsArr[i].Folder_MeshPhysical = tempFolder.addFolder(`--MeshPhysical材质`);
        guiParamsArr[i].Folder_MeshPhysical.addColor(guiParamsArr[i].Folder_MeshPhysicalParams, 'color')
            .name('颜色 color').onChange((color) => {
                materials[i].color.set(color);
                // gydjModel.traverse(function (child) {
                //     if (child instanceof THREE.Mesh) {
                //         if (child.material.name + 'Params' == materials[i].name) {
                //             child.material.color.set(color);
                //         }
                //     }
                // })
            });
        guiParamsArr[i].Folder_MeshPhysical.add(guiParamsArr[i].Folder_MeshPhysicalParams, 'map', mapResObj).name('贴图').onChange(function (value) {
            materials[i].map = track(new THREE.TextureLoader().load(value));
            materials[i].needsUpdate = true;
        });

        guiParamsArr[i].Folder_MeshPhysical.add(guiParamsArr[i].Folder_MeshPhysicalParams, 'aoMap', mapResObj).name('AO贴图').onChange(function (value) {
            materials[i].aoMap = track(new THREE.TextureLoader().load(value));
            materials[i].needsUpdate = true;
        });

        guiParamsArr[i].Folder_MeshPhysical.add(guiParamsArr[i].Folder_MeshPhysicalParams, 'metalness', 0, 1).name('金属度')
            .onChange(function (value) {
                materials[i].metalness = value;
            });

        guiParamsArr[i].Folder_MeshPhysical.add(guiParamsArr[i].Folder_MeshPhysicalParams, 'roughness', 0, 1)
            .name('粗糙度').onChange(function (value) {
                materials[i].roughness = value;
            });
        guiParamsArr[i].Folder_MeshPhysical.add(guiParamsArr[i].Folder_MeshPhysicalParams, 'clearcoat', 0.0, 1)
            .name('清漆图层').onChange(function (value) {
                materials[i].clearcoat = value;
            });
        guiParamsArr[i].Folder_MeshPhysical.add(guiParamsArr[i].Folder_MeshPhysicalParams, 'clearcoatRoughness', 0.0, 1)
            .name('清漆图层的粗糙度').onChange(function (value) {
                materials[i].clearcoat = value;
            });
        guiParamsArr[i].Folder_MeshPhysical.add(guiParamsArr[i].Folder_MeshPhysicalParams, 'ior', 1, 2.333)
            .name('ior').onChange(function (value) {
                materials[i].ior = value;
            });
        guiParamsArr[i].Folder_MeshPhysical.add(guiParamsArr[i].Folder_MeshPhysicalParams, 'reflectivity', 0, 1)
            .name('反射率').onChange(function (value) {
                materials[i].reflectivity = value;
            });


    }
}

function add_MeshMatcap(tempFolder, i) {
    if (guiParamsArr[i].Folder_MeshMatcap) {
        guiParamsArr[i].Folder_MeshMatcap.show()

    } else {
        guiParamsArr[i].Folder_MeshMatcap = tempFolder.addFolder(`--MeshMatcap材质`);

        guiParamsArr[i].Folder_MeshMatcap.addColor(guiParamsArr[i].Folder_MeshMatcapParams, 'color').name('颜色 color')
            .onChange((color) => {
                materials[i].color.set(color);
            });
        guiParamsArr[i].Folder_MeshMatcap.add(guiParamsArr[i].Folder_MeshMatcapParams, 'map', mapResObj).name('贴图').onChange(function (value) {
            materials[i].map = track(new THREE.TextureLoader().load(value));
            materials[i].needsUpdate = true;
        });

    }
}

function add_MeshStandard(tempFolder, i) {
    if (guiParamsArr[i].Folder_MeshStandard) {
        guiParamsArr[i].Folder_MeshStandard.show()

    } else {
        guiParamsArr[i].Folder_MeshStandard = tempFolder.addFolder(`--Mesh Standard材质`);

        guiParamsArr[i].Folder_MeshStandard.addColor(guiParamsArr[i].Folder_MeshStandardParams, 'color').name('颜色 color')
            .onChange((color) => {
                materials[i].color.set(color);
            });
        guiParamsArr[i].Folder_MeshStandard.add(guiParamsArr[i].Folder_MeshStandardParams, 'map', mapResObj).name('贴图').onChange(function (value) {
            materials[i].map = track(new THREE.TextureLoader().load(value));
            materials[i].needsUpdate = true;
        });
        guiParamsArr[i].Folder_MeshStandard.add(guiParamsArr[i].Folder_MeshStandardParams, 'aoMap', mapResObj).name('高光贴图').onChange(function (value) {
            materials[i].aoMap = track(new THREE.TextureLoader().load(value));
            materials[i].needsUpdate = true;
        });



        guiParamsArr[i].Folder_MeshStandard.add(guiParamsArr[i].Folder_MeshStandardParams, 'metalness', 0, 1).name('金属度')
            .onChange(function (value) {
                materials[i].metalness = value;
            });

        guiParamsArr[i].Folder_MeshStandard.add(guiParamsArr[i].Folder_MeshStandardParams, 'roughness', 0, 1)
            .name('粗糙度').onChange(function (value) {
                materials[i].roughness = value;
            });

        guiParamsArr[i].Folder_MeshStandard.add(guiParamsArr[i].Folder_MeshStandardParams, 'reflectivity', 0, 1)
            .name('反射率').onChange(function (value) {
                materials[i].reflectivity = value;
            });


        guiParamsArr[i].Folder_MeshStandard.addColor(guiParamsArr[i].Folder_MeshStandardParams, 'emissive').name('emissive')
            .onChange((color) => {
                materials[i].emissive.set(color);
            });


        guiParamsArr[i].Folder_MeshStandard.add(guiParamsArr[i].Folder_MeshStandardParams, 'emissiveIntensity', 0, 3)
            .name('emissive强度').onChange(function (value) {
                materials[i].emissiveIntensity = value;
            });
        // folder0.add(guiParams, 'rendererAntialias').name('抗锯齿')
        //     .onChange(function (value) {
        //         renderer.antialias = value;
        //     });
        guiParamsArr[i].Folder_MeshStandard.add(guiParamsArr[i].Folder_MeshStandardParams, 'flatShading')
            .name('flatShading').onChange(function (value) {
                materials[i].flatShading = value;
            });
        // guiParamsArr[i].Folder_MeshStandard.add(guiParamsArr[i].Folder_MeshStandardParams, 'shininess', 0, 100)
        //     .name('高亮').onChange(function (value) {
        //         materials[i].shininess = value;
        //     });

        // guiParamsArr[i].Folder_MeshStandard.add(guiParamsArr[i].Folder_MeshStandardParams, 'reflectivity', 0, 1)
        //     .name('reflectivity').onChange(function (value) {
        //         materials[i].shininess = value;
        //     });

    }
}

function add_MeshPhong(tempFolder, i) {
    if (guiParamsArr[i].Folder_MeshPhong) {
        guiParamsArr[i].Folder_MeshPhong.show()

    } else {
        guiParamsArr[i].Folder_MeshPhong = tempFolder.addFolder(`--MeshPhong材质`);

        guiParamsArr[i].Folder_MeshPhong.addColor(guiParamsArr[i].Folder_MeshPhongParams, 'color').name('颜色 color')
            .onChange((color) => {
                materials[i].color.set(color);
            });
        guiParamsArr[i].Folder_MeshPhong.add(guiParamsArr[i].Folder_MeshPhongParams, 'map', mapResObj).name('贴图').onChange(function (value) {
            materials[i].map = track(new THREE.TextureLoader().load(value));
            materials[i].needsUpdate = true;
        });
        guiParamsArr[i].Folder_MeshPhong.add(guiParamsArr[i].Folder_MeshPhongParams, 'aoMap', mapResObj).name('高光贴图').onChange(function (value) {
            materials[i].aoMap = track(new THREE.TextureLoader().load(value));
            materials[i].needsUpdate = true;
        });
        guiParamsArr[i].Folder_MeshPhong.addColor(guiParamsArr[i].Folder_MeshPhongParams, 'emissive').name('放光 emissive')
            .onChange((color) => {
                materials[i].emissive.set(color);
            });


        guiParamsArr[i].Folder_MeshPhong.add(guiParamsArr[i].Folder_MeshPhongParams, 'emissiveIntensity', 0, 3)
            .name('emissive强度').onChange(function (value) {
                materials[i].emissiveIntensity = value;
            });

        guiParamsArr[i].Folder_MeshPhong.add(guiParamsArr[i].Folder_MeshPhongParams, 'shininess', 0, 100)
            .name('高亮').onChange(function (value) {
                materials[i].shininess = value;
            });

        guiParamsArr[i].Folder_MeshPhong.add(guiParamsArr[i].Folder_MeshPhongParams, 'reflectivity', 0, 1)
            .name('reflectivity').onChange(function (value) {
                materials[i].shininess = value;
            });

    }
}




function init() {
    scene = new THREE.Scene();
    // console.log(scene.fog);
    // scene.fog = new THREE.Fog(0xcccccc, 10, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);//将渲染器的像素比率设置为设备的像素比率
    // renderer.setClearColor(0x020512, 0); //bgcolor#FFFACD
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.CineonToneMapping; //设置色调映射算法为 电影胶片的色调
    renderer.toneMappingExposure = 1; //曝光

    // console.log(qimian01_material);
    // gui.add(qimian01_material, 'metalness', 0, 1).name('金属度');
    // gui.add(qimian01_material, 'roughness', 0, 1).name('粗糙度');


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

    // 创建空间辅助坐标系
    axesHelper = track(new THREE.AxesHelper(200)); // 参数指定坐标轴的长度

}




function loadMoudel() {
    new RGBELoader().setDataType(THREE.FloatType).setPath('/hdr/')
        .load(hdrUrl, function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping; //设置材质的贴图映射方式为全景反射映射
            // scene.background = texture; // 将HDR立方体贴图应用为场景的背景
            scene.environment = track(texture); //将HDR环境贴图应用于场景的环境。
            showLoading.value = true
            new FBXLoader().setPath('/models/jzkgydj/').load('gydj560kW-04.fbx',
                function (object) {
                    gydjModel = track(object)
                    object.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            if (materials.some(obj => obj.name === child.material.name)) {
                                child.material = materials.filter(obj => obj.name === child.material.name)[0]
                                child.material.needsUpdate = true;
                            } else {
                                child.material = new THREE.MeshMatcapMaterial({
                                    color: child.material.color,
                                    name: child.material.name
                                })
                                child.material.transparent = true;
                                child.material.userData.materialType = 'MeshMatcapMaterial'
                                materials.push(child.material);
                            }

                        }
                    })

                    object.position.set(0, 0, 0);
                    object.name = "gydjModel";
                    mixer = new THREE.AnimationMixer(gydjModel);
                    scene.add(gydjModel);

                    showLoading.value = false
                    animate();

                    axios.get('http://127.0.0.1:8080/api/getMap').then(res => {
                        if (res.status == 200) {
                            for (let obj of res.data) {
                                mapResObj[obj.name] = obj.path;
                            }
                            initGui()
                        }
                    })
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
    var delta = clock.getDelta();
    mixer.update(delta);
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

    // var animationNames = [];
    // gydjModel.animations.forEach(function (animationClip) {
    //     animationNames.push(animationClip.name);
    // });
    // console.log(animationNames);

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

        if (intersectedObject.name == "Cyibiaoke" || intersectedObject.name == "Ayibiaoke" || intersectedObject.name == "Byibiaoke") {
            // intersectedObject.material.color.set(0xffffff);
            console.log(intersectedObject.material.userData);
            intersectedObject.material = new THREE.MeshNormalMaterial({

            })


            // LLshow(intersectedObject.parent)
        }
        if (intersectedObject.name == "cemian_hou_0") {
            console.log("触发");
        }
    }
}
// =====================检测点击事件end=====================
/**切换场景 */
function changeHDR() {
    if (hdrUrl == 'startup.hdr') {
        hdrUrl = 'h1.hdr'
    } else {
        hdrUrl = 'startup.hdr'
    }

    new RGBELoader()
        .setDataType(THREE.FloatType).setPath('/hdr/')
        .load(hdrUrl, function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = hdrUrl == 'startup.hdr' ? sceneBackground : texture;
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


//

// const moduleRef = ref(null);

// const LLshow = (Object) => {
//     moduleRef.value.LLshow(Object.clone());
// };

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
