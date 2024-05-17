<template>
    <div class="edit-box">
        <div class="header">
            <div class="headerTitle">动画列表</div>
            {{ llObj.b }}
            {{ modelApi.modelAnimation ? modelApi.modelAnimation.length : '？' }}
        </div>
        <!-- 列表 -->
        <div class="M_Lists">
            <div class="M_List" @click="onChangeSelectMesh(ani)" v-for="ani in modelApi.modelAnimation" :key="ani.uuid">
                <n-icon size="18" color="#409eff" v-if="true">
                    <PlayCircleOutline />
                </n-icon>
                <n-icon size="18" v-else>
                    <PlayCircleOutline />
                </n-icon>
                <div class="M_List_name">
                    {{ ani.name }}
                </div>
                <div class="">
                    <n-button strong secondary type="primary" size="tiny" @click="playAni(ani, 'play')"
                        style="margin-right:10px">
                        播放
                    </n-button>

                    <n-button strong secondary type="primary" size="tiny" @click="playAni(ani, 'pause')"
                        style="margin-right:10px">
                        暂停
                    </n-button>
                    <n-button strong secondary type="primary" size="tiny" @click="playAni(ani, 'stop')">
                        停止
                    </n-button>
                </div>


            </div>
        </div>
        <!-- 
      
        <div class="header">
            <div class="headerTitle">属性</div>

        </div>
        <div class="options" v-if="store.selectMesh.material">
            <div class="option">
                <div class="icon-name">
                    <n-space>
                        <n-icon size="22px">
                            <ColorPaletteOutline />
                        </n-icon>
                        <span> 所属材质：</span>
                    </n-space>
                </div>
                <div class="action">
                    <n-select v-model:value="store.selectMesh_materialName" :disabled="!selectMesh.name"
                        :options="meshUseMaterialList" @update:value="change_material_use" size="small"
                        style="width: 200px" />
                </div>

            </div>
        </div> -->
    </div>
</template>
<script setup>
import * as THREE from 'three' //导入整个 three.js核心库
import axios from 'axios';

import { ref, reactive, computed, onMounted, onUnmounted, watchEffect, watch } from "vue";
import { meshTypeList } from "@/config/constant";
import { backgrundList } from "@/config/model.js";
import { NUpload, NButton, NSelect, NText, NIcon, NSpace, NP, NSlider, NSwitch, NColorPicker, NScrollbar, NImageGroup, NImage } from 'naive-ui'
import { PlayCircleOutline, Images, Checkmark, EyeOutline, EyeOffOutline } from '@vicons/ionicons5'


import { storeToRefs } from 'pinia'
import { useStore } from '@/store'



const store = useStore();
const { modelApi, modelMaterialList, selectMesh, llObj } = storeToRefs(store);
// 选择mesh
const onChangeSelectMesh = () => {
    console.log('点击');
};
const playAni = (ani, option) => {
    store.modelApi.playAni(ani.name, option)
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
</style>
  
  