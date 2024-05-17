<template>
    <div class="edit-box">
        <div class="header">
            <div class="headerTitle">场景效果</div>
        </div>
        <!-- 材质列表 -->

        <!-- 
       -->
        <div class="options">
            <div class="option">
                <div class="icon-name">
                    <n-space>
                        <n-icon size="22px">
                            <ColorPaletteOutline />
                        </n-icon>
                        <span> 色调映射：</span>
                    </n-space>
                </div>
                <div class="action">
                    <n-select v-model:value="sdys" :options="meshUseMaterialList" @update:value="change_sdys" size="tiny"
                        style="width: 200px" />
                </div>

            </div>
        </div>
        <div class="header">
            <div class="headerTitle">平行光</div>
            <n-switch v-model:value="config.directionalLight" @update:value="onChangeDirectionalLight" />
        </div>
        <div class="options" :class="directionaDisabled">
            <div class="option">
                <!-- 阴影  -->
                <div class="grid-txt">
                    <n-button type="primary" quaternary disabled>是否开启阴影</n-button>
                </div>
                <div class="grid-silder">
                    <n-switch v-model:value="config.directionaShadow" @update:value="onChangeDirectionalLight" size="small"
                        disabled />
                </div>
                <!-- 辅助线 -->

                <div class="grid-txt">
                    <n-button type="primary" quaternary disabled>辅助线</n-button>
                </div>
                <div class="grid-silder">
                    <n-switch v-model:value="config.directionalLightHelper" @update:value="onChangeDirectionalLight"
                        size="small" />
                </div>

            </div>
            <!-- 水平方向 -->
            <div class="option" :class="directionaDisabled">
                <div class="grid-txt">
                    <n-button type="primary" quaternary disabled>水平方向</n-button>
                </div>
                <div class="grid-silder">
                    <n-slider v-model:value="config.directionalHorizontal" @update:value="onChangeDirectionalLight"
                        :step="0.01" :min="-10" :max="10" disabled />
                    <!-- <n-input-number v-model:value="config.directionalHorizontal" size="small" /> -->
                </div>
            </div>
            <!-- 垂直方向方向 -->
            <div class="option" :class="directionaDisabled">
                <div class="grid-txt">
                    <n-button type="primary" quaternary disabled>垂直方向</n-button>
                </div>
                <div class="grid-silder">
                    <n-slider @update:value="onChangeDirectionalLight" v-model:value="config.directionalVertical" :min="-10"
                        :max="10" :step="0.1" disabled />
                </div>
            </div>
            <!-- 光源距离 -->
            <div class="option" :class="directionaDisabled">
                <div class="grid-txt">
                    <n-button type="primary" quaternary disabled>光源距离</n-button>
                </div>
                <div class="grid-silder">
                    <n-slider @update:value="onChangeDirectionalLight" disabled v-model:value="config.directionalSistance"
                        :min="0" :max="100" :step="0.1" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import * as THREE from 'three' //导入整个 three.js核心库
import axios from 'axios';

import { ref, reactive, computed, onMounted, onUnmounted, watchEffect, watch } from "vue";
import { meshTypeList } from "@/config/constant";
import { backgrundList } from "@/config/model.js";
import { NUpload, NButton, NSelect, NText, NIcon, NSpace, NInputNumber, NSlider, NSwitch, NColorPicker, NScrollbar, NImageGroup, NImage, logDark } from 'naive-ui'
import { ColorPaletteOutline, Images, Checkmark, EyeOutline, EyeOffOutline } from '@vicons/ionicons5'


import { storeToRefs } from 'pinia'
import { useStore } from '@/store'

const store = useStore();
const { modelApi, modelMaterialList, selectMesh, llObj } = storeToRefs(store);

const config = reactive({
    //光源平面
    planeGeometry: false,
    planeColor: "#000000",
    planeWidth: 7,
    planeHeight: 7,
    //环境光
    ambientLight: true,
    ambientLightColor: "#fff",
    ambientLightIntensity: 0.8,
    //平行光
    directionalLight: false,
    directionalLightHelper: true,
    directionalLightColor: "#fff",
    directionalLightIntensity: 5,
    directionalHorizontal: -1.26, //x
    directionalVertical: -3.85,  //y 
    directionalSistance: 2.98,  //z
    directionaShadow: false,
    //点光源
    pointLight: false,
    pointLightHelper: true,
    pointLightColor: "#1E90FF",
    pointLightIntensity: 10,
    pointHorizontal: -4.21,
    pointVertical: -4.1,
    pointSistance: 2.53,
    //聚光灯
    spotLight: false,
    spotLightColor: "#00BABD",
    spotLightIntensity: 900,
    spotHorizontal: -3.49,
    spotVertical: -4.37,
    spotSistance: 4.09,
    spotAngle: 0.5,
    spotPenumbra: 1,
    spotFocus: 1,
    spotCastShadow: true,
    spotLightHelper: true,
    spotDistance: 20
});
const directionaDisabled = computed(() => {
    return config.directionalLight ? "" : "disabled";
});

const sdys = ref(3)
var meshUseMaterialList = [
    {
        label: 'NoToneMapping',
        value: THREE.NoToneMapping
    }, {
        label: 'LinearToneMapping',
        value: THREE.LinearToneMapping
    }, {
        label: 'ReinhardToneMapping',
        value: THREE.ReinhardToneMapping // 3
    }, {
        label: 'CineonToneMapping',
        value: THREE.CineonToneMapping
    }, {
        label: 'ACESFilmicToneMapping',
        value: THREE.ACESFilmicToneMapping
    }
]




onMounted(async () => {

})



// 改变色调映射
const change_sdys = (value) => {
    store.modelApi.change_renderer_toneMapping(value);
}

// 设置平行光
const onChangeDirectionalLight = () => {
    // if (config.directionalLight) {
    //     config.planeGeometry = true;
    //     store.modelApi.onSetModelPlaneGeometry(config);
    // }
    store.modelApi.onSetModelDirectionalLight(config);
};

</script>
<style lang="less" scoped>
.edit-box {
    // background-color: #33343f;
    color: #fff;
    user-select: none;

    .header {
        background-color: #33343f;
        height: 40px;
        line-height: 40px;
        font-size: 16px;
        display: flex;
        align-items: center;
        padding: 0 20px;

        .headerTitle {
            flex: 1;
        }
    }
}

.M_Lists {
    box-sizing: border-box;
    height: 300px;
    overflow-y: auto;

    .M_List {
        display: flex;
        align-items: center;
        padding: 2px 10px;
        height: 30px;
        cursor: pointer;

        .M_List_name {
            height: 100%;
            display: flex;
            margin: 0 10px;
            align-items: center;
        }
    }

    .M_List:nth-child(even) {
        background: linear-gradient(to right, #2a2b35, #1b1c23);
    }
}


.options {
    padding: 2px;
    border-bottom: 1px solid rgba(176, 176, 176, 0.412);
    user-select: none;

    .option {
        display: flex;
        align-items: center;
        padding: 2px 10px;

        .icon-name {
            height: 100%;
            display: flex;
            // align-items: end;
            padding-top: 6px;

        }

        .action {
            width: 200px;
            height: 100%;
            display: flex;
            align-items: center;
        }

        .check {
            height: 100%;
            display: flex;
            align-items: center;
        }
    }

    .n-img {
        width: 78px;
        height: 40px;
        border: 1px solid #555;

        cursor: pointer;
        margin-bottom: 4px;
    }

    .selectActive {
        border: 2px solid #18a058;
    }

    .mapImg {
        cursor: pointer;

    }

    .mapImg_active {
        cursor: pointer;
        border: 2px solid #18a058;
    }
}


.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.grid-silder {
    flex: 5;
    padding-left: 10px;

}
</style>
  