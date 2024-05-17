<template>
    <div class="edit-box">
        <div class="header">
            <div class="headerTitle">场景模型列表</div>
            {{ llObj.b }}
            {{ modelList ? modelList.length : '0' }}
        </div>
        <!-- 列表 -->
        <div class="M_Lists">
            <div class="M_List" @click="onChangeSelectModel(model)" v-for="(model, index) in modelList" :key="model.uuid">
                <n-icon v-if="model.setting.visible" @click="onSetModelVisibe(model)" size="18" color="#409eff">
                    <EyeOutline />
                </n-icon>
                <n-icon v-else size="18" @click="onSetModelVisibe(model)">
                    <EyeOffOutline />
                </n-icon>
                <div class="M_List_name">
                    {{ model.ModelName }}
                    --{{ model.id }}
                </div>

                <div class="check" v-show="selectModel.id == model.id">
                    <n-icon size="20px" color="#2a3ff6">
                        <Checkmark />
                    </n-icon>
                </div>
            </div>
        </div>
        <div class="header">
            <div class="headerTitle">属性</div>
            {{ selectModel_Name }}
        </div>
        <div class="options" v-if="selectModel_Name">
            <div class="option">
                <div class="icon-name">
                    <n-space>
                        <n-icon size="22px">
                            <ColorPaletteOutline />
                        </n-icon>
                        <span> 等比缩放：</span>

                    </n-space>
                </div>
                <div class="action">
                    <n-input-number v-model:value="config.scale" @update:value="onChangeScale" size="small"
                        button-placement="both" style="text-align: center;width: 120px;" />
                </div>
            </div>
        </div>
        <div class="options" v-if="selectModel_Name">
            <div class="option">
                <div class="icon-name">
                    <n-space>
                        <n-icon size="22px">
                            <ColorPaletteOutline />
                        </n-icon>
                        <span> 整体拖动：</span>
                    </n-space>
                </div>
                <div class="action">
                    <n-switch v-model:value="config.drag" @update:value="onSetDrag" />
                </div>
            </div>
        </div>
        <div class="options" v-if="selectModel_Name">
            <div class="option">
                <div class="icon-name">
                    <n-space>
                        <n-icon size="22px">
                            <ColorPaletteOutline />
                        </n-icon>
                        <span> 旋转：</span>
                    </n-space>
                </div>
                <br>
                <div class="action_list">
                    <div class="option">
                        <div class="grid-txt">
                            <n-button type="primary" quaternary>x轴旋转</n-button>
                        </div>
                        <div class="grid-silder">
                            <n-slider v-model:value="config.rotation.x" @update:value="onChangeRotation" :step="0.1"
                                :min="-5" :max="5" />
                            <!-- <n-input-number v-model:value="config.directionalHorizontal" size="small" /> -->
                        </div>
                    </div>
                    <div class="option">
                        <div class="grid-txt">
                            <n-button type="primary" quaternary>y轴旋转</n-button>
                        </div>
                        <div class="grid-silder">
                            <n-slider @update:value="onChangeRotation" v-model:value="config.rotation.y" :min="-5" :max="5"
                                :step="0.1" />
                        </div>
                    </div>
                    <div class="option">
                        <div class="grid-txt">
                            <n-button type="primary" quaternary>z轴旋转</n-button>
                        </div>
                        <div class="grid-silder">
                            <n-slider @update:value="onChangeRotation" v-model:value="config.rotation.z" :min="-5" :max="5"
                                :step="0.1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
// import * as THREE from 'three' //导入整个 three.js核心库
// import axios from 'axios';

import { ref, reactive, computed, onMounted, onUnmounted, watchEffect, watch } from "vue";
import { meshTypeList } from "@/config/constant";
import { backgrundList } from "@/config/model.js";
import { NInputNumber, NButton, NSelect, NText, NIcon, NSpace, NP, NSlider, NSwitch } from 'naive-ui'
import { ColorPaletteOutline, Images, Checkmark, EyeOutline, EyeOffOutline } from '@vicons/ionicons5'


import { storeToRefs } from 'pinia'
import { useStore } from '@/store'


const store = useStore();
const { modelList, selectModel, llObj } = storeToRefs(store);



const config = reactive({
    id: 1,
    name: 'config',
    scale: 1,
    drag: false,
    rotation: {
        x: 0, y: 0, z: 0
    }
});

onMounted(async () => {

})



// 设置model显隐
const onSetModelVisibe = (model) => {
    let mo = store.modelApi.getObjectById(model.id);

    mo.visible = !mo.visible; //模型显示隐藏
    model.setting.visible = mo.visible;//store模型信息同步  store.setting.visible
}



// 切换选中的model========start
const selectModel_Name = ref(''); // 当前选中模型的名字
const onChangeSelectModel = (model) => {
    store.modelApi.setNowModel({ id: model.id });

    // 清除上个model的拖动控制
    config.drag = false;
};

watchEffect(() => {
    if (store.selectModel_Name) {
        selectModel_Name.value = store.selectModel_Name;
        config.scale = store.selectModel.scale.x;
        config.rotation = { x: store.selectModel.rotation.x, y: store.selectModel.rotation.y, z: store.selectModel.rotation.z }
    }
})
// 切换选中的model========end



const onChangeScale = (num) => { store.selectModel.scale.set(num, num, num) }
const onSetDrag = (isDrag) => {
    // 设置拖拽控制器
    store.modelApi.onSetModelDrag(isDrag)

}

const onChangeRotation = () => {
    let { x, y, z } = config.rotation;
    store.selectModel.rotation.set(x, y, z);
}

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

        .action_list {
            width: 240px;
            height: 100%;
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

    .grid-silder {
        flex: 5;
        padding-left: 10px;

    }
}
</style>
  