<template>
    <LLoading v-if="store.showLoading" :progress="progress" />
    <div class="editView">
        <div class="editTitle">
            新增材质待完善，导出glb待优化，
        </div>
        <div class="editMain">

            <ModelOptions></ModelOptions>
            <div id="threeContainer"></div>
            <RightSetting></RightSetting>
        </div>
        <div class="editBottom">

        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import axios from 'axios';
import ModelOptions from '@/components/ModelOptions.vue'
import RightSetting from '@/components/RightSetting/index.vue'
// import { camera, setCamera } from './render/camera'
// import { buxiugang_material, qimian01_material, suliao_material } from './render/loadMaterial'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
// import Stats from 'three/examples/jsm/libs/stats.module.js'

import { useMessage } from "naive-ui";
import renderModel from "./renderModel";

const message = useMessage();


import { useStore } from '@/store'
const store = useStore();




import LLoading from "@/components/LLoading.vue";
import { NButton } from 'naive-ui'
// import { track, resMgr } from './render/track'



// import { clientHeight, clientWidth } from './render/getWindow'



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

const showLoading = ref(true)
var progress = ref("0"); //loading...

var threeContainer
var hdrUrl = 'startup.hdr'

const mapResObj = reactive({})

// init()
// loadHDR()

showLoading.value = false


onMounted(async () => {
    const modelApi = new renderModel("#threeContainer");
    store.modelApi = modelApi

    const load = await modelApi.init();
})
onUnmounted(() => {
    // destroyThreejs()
});

// // 窗口大小自适应
// window.addEventListener('resize', onWindowResize, false);
// function onWindowResize() {
//     camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
//     // camera.aspect = window.clientWidth / window.clientHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
// };
</script>

<style scoped lang="less">
body {
    margin: 0;
    padding: 0;
}

.editView {
    width: 100%;
    height: 100vh;


    .editTitle {
        height: 30px;
        background-color: #0e184e;
        color: #fff;
        font-size: 1rem;
        line-height: 30px;
    }

    .editMain {
        height: calc(100% - 30px);
        box-sizing: border-box;
        // width: 100%;
        display: flex;

        #threeContainer {
            width: 100%;
            height: 100%;
            flex: 1;
        }

    }
}

.disabled {
    opacity: 0.3;
    pointer-events: none;
}
</style>
