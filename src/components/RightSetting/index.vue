<template>
    <div style="position: relative;">
        <div class="model-panel">
            <ul class="panel-tabs">
                <li v-for="tab in panelTabs" :key="tab.key" :class="activeTab == tab.key ? 'active' : ''"
                    @click="activeTab = tab.key">

                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-icon size="20px" :depth="1" color="#fff">
                                <ImageOutline v-if="tab.key == 'EditBackground'" />
                                <ColorFillOutline v-if="tab.key == 'EditMaterial'" />
                                <ConstructOutline v-if="tab.key == 'EditMesh'" />
                                <BulbOutline v-if="tab.key == 'EditLight'" />
                                <CaretForwardCircleOutline v-if="tab.key == 'EditAnimation'" />
                                <HelpCircleOutline v-if="tab.key == 'EditHelper'" />
                                <SettingsOutline v-if="tab.key == 'EditGeometry'" />
                            </n-icon>
                        </template>
                        {{ tab.name }}
                    </n-tooltip>
                    <!-- <el-tooltip effect="light" :content="tab.name" placement="top">
                    <div class="tab">
                        <n-icon size="20px" :depth="3" color="#fff">
                            <ImageOutline />
                        </n-icon>
                    </div>
                </el-tooltip> -->
                </li>
            </ul>
            <div class="panel-edit">
                <!-- 背景 -->
                <div v-show="activeTab == 'EditBackground'">
                    <EditBackground></EditBackground>
                </div>
                <!-- 材质 -->
                <div v-show="activeTab == 'EditMaterial'">
                    <EditMaterial></EditMaterial>
                </div>
                <!-- 网格 -->
                <div v-show="activeTab == 'EditMesh'">
                    <EditMesh></EditMesh>
                </div>
                <!-- 灯光 -->
                <div v-show="activeTab == 'EditLight'">
                    <EditLight></EditLight>
                </div>
                <!-- 动画 -->
                <div v-show="activeTab == 'EditAnimation'">
                    <EditAnimation></EditAnimation>
                </div>

                <!-- 辅助线配置 -->
                <div v-show="activeTab == 'EditHelper'">
                    <EditHelper></EditHelper>
                </div>
                <!-- 几何体配置 -->
                <div v-show="activeTab == 'EditGeometry'">
                    <EditModel></EditModel>
                </div>
            </div>
        </div>
        <div class="CenterIcon">

            <n-tooltip trigger="hover">
                <template #trigger>
                    <n-icon-wrapper :size="26" :border-radius="20" @click="throttle(resetCamera, 1000)"
                        class="resetCameraIcon">
                        <!--  color="#4d57fd" -->
                        <n-icon size="24" color="#fff">
                            <HelpBuoyOutline />
                        </n-icon>
                    </n-icon-wrapper>
                </template>
                居中
            </n-tooltip>


        </div>
    </div>
</template>
<script setup>
import { ref, reactive } from "vue";

import { NUpload, NButton, NUploadDragger, NText, NIcon, NIconWrapper, NP, useNotification, NTooltip } from 'naive-ui'
import { ImageOutline, ColorFillOutline, CaretForwardCircleOutline, BulbOutline, HelpCircleOutline, ConstructOutline, SettingsOutline, HelpBuoyOutline } from '@vicons/ionicons5'
import EditBackground from "./EditBackground.vue";//背景 编辑
import EditMaterial from "./EditMaterial.vue";//材质 编辑
import EditMesh from "./EditMesh.vue";//网格 编辑
import EditLight from "./EditLight.vue";//网格 编辑
import EditModel from "./EditModel.vue";//模型整体设置(缩放，旋转，位置?)
import EditAnimation from "./EditAnimation.vue";//动画 编辑
import EditHelper from "./EditHelper.vue";//辅助线，地面等

import { throttle } from "../../utils/utilityFunction"


import { useStore } from '@/store'

const store = useStore();

const panelTabs = [
    {
        name: "背景",
        key: "EditBackground",
        icon: "ImageOutline",
    },
    {
        name: "材质",
        key: "EditMaterial",
        icon: "ColorFillOutline",
    },
    {
        name: "网格",
        key: "EditMesh",
        icon: "ConstructOutline",
    },
    {
        name: "灯光",
        key: "EditLight",
        icon: "BulbOutline",
    },
    {
        name: "模型动画",
        key: "EditAnimation",
        icon: "CaretForwardCircleOutline",
    },
    {
        name: "辅助线/轴配置",
        key: "EditHelper",
        icon: "HelpCircleOutline",
    },
    {
        name: "模型整体配置",
        key: "EditGeometry",
        icon: "SettingsOutline",
    },
];
const activeTab = ref("EditHelper");
const background = ref(null);
const material = ref(null);
const animation = ref(null);
const attribute = ref(null);
const light = ref(null);
const stage = ref(null);
const geometry = ref(null)
// 获取所有面板配置
const getPanelConfig = () => {
    return {
        background: background.value.config,
        material: material.value.getMeshConfig(),
        animation: animation.value.config,
        attribute: attribute.value.getAttrbuteConfig(),
        light: light.value.config,
        stage: stage.value.getStageConfig(),
    };
};
defineExpose({
    getPanelConfig,
});


// 
const resetCamera = () => {
    store.modelApi.resetCamera()
}

</script>
<style lang="less" scoped>
.model-panel {
    background-color: #1b1c23;
    min-width: 380px;
    max-width: 380px;
    // height: calc(100vh - 35px);
    height: 100%;

    .panel-tabs {
        display: flex;
        margin: 0;
        padding: 0;

        .active {
            background-color: #4d57fd;
        }

        li {
            cursor: pointer;
            color: #888;
            background: #272830;
            padding: 10px;
            border-right: 1px solid #0a0a0a;
            display: flex;
            align-items: center;

            .tab {
                line-height: initial;
            }
        }
    }
}



.CenterIcon {
    position: absolute;
    width: 100px;
    top: 2px;
    left: -102px;
    text-align: right;
    user-select: none;

    .resetCameraIcon {
        cursor: pointer;
    }

}
</style>
  