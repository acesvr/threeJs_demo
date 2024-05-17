<template>
    <div class="edit-box">
        <div class="header">
            <div class="headerTitle">背景</div>
            <n-switch v-model:value="config.visible" @update:value="onChangeBgSwitch" />
        </div>
        <!-- 颜色 -->
        <div class="options" :class="optionsDisable">
            <div class="option" @click="onChangeType(1)">
                <n-space>
                    <div class="icon-name">
                        <n-space>
                            <n-icon size="22px">
                                <ColorPaletteOutline />
                            </n-icon>
                            <span> 颜色</span>
                        </n-space>
                    </div>
                    <div class="action">
                        <n-color-picker size="small" :show-alpha="false" :modes="['hex']" :swatches="[
                            '#FFFFFF',
                            '#18A058',
                            '#2080F0',
                            '#F0A020'
                        ]" @update:value="onChangeColor" @active-change="activeChangeColor" v-model="config.color" />
                    </div>
                    <div class="check" v-show="config.type == 1">
                        <n-icon size="30px" color="#18a058">
                            <Checkmark />
                        </n-icon>
                    </div>
                </n-space>
            </div>
        </div>
        <!-- 图片 -->
        <div class="options" :class="optionsDisable">
            <div class="option" @click="onChangeType(2)">
                <n-space>
                    <div class="icon-name">
                        <n-space>
                            <n-icon size="22px">
                                <ColorPaletteOutline />
                            </n-icon>
                            <span> 图片</span>
                        </n-space>
                    </div>
                    <!-- <div class="action-txt">
                        <n-button quaternary type="primary">选择图片</n-button>
                    </div> -->
                    <div class="check" v-show="config.type == 2">
                        <n-icon size="30px" color="#18a058">
                            <Checkmark />
                        </n-icon>
                    </div>
                </n-space>
            </div>
            <div v-show="config.type == 2">
                <n-scrollbar max-height="250px">
                    <n-space>
                        <div v-for="background in backgrundList" :key="background.id">
                            <n-image @click="onChangeImage(background)" preview-disabled
                                :class="activeBackgroundId == background.id ? 'n-img selectActive' : 'n-img'"
                                :src="background.url" fit="cover" />
                        </div>
                    </n-space>
                </n-scrollbar>
            </div>

        </div>

        <!-- 全景图 -->
        <div class="options" :class="optionsDisable">
            <div class="option" @click="onChangeType(3)">
                <n-space>
                    <div class="icon-name">
                        <n-space>
                            <n-icon size="22px">
                                <ColorPaletteOutline />
                            </n-icon>
                            <span> 全景图</span>
                        </n-space>
                    </div>
                    <!-- <div class="action-txt">
                        <n-button quaternary type="primary">选择图片</n-button>
                    </div> -->
                    <div class="check" v-show="config.type == 3">
                        <n-icon size="30px" color="#18a058">
                            <Checkmark />
                        </n-icon>
                    </div>
                </n-space>
            </div>
            <div v-show="config.type == 3">
                <n-scrollbar max-height="350px">
                    <n-space>
                        <div v-for="view in viewImageList" :key="view.id">
                            <n-image @click="onChangeViewImage(view)" preview-disabled
                                :class="activeViewImageId == view.id ? 'n-img selectActive' : 'n-img'" :src="view.url" />
                        </div>
                    </n-space>
                </n-scrollbar>
            </div>
        </div>

    </div>
</template>
<script setup>
import { ref, reactive, computed } from "vue";
// import { PREDEFINE_COLORS } from "@/config/constant";
import { backgrundList, viewImageList } from "@/config/model.js";
import { NUpload, NButton, NUploadDragger, NText, NIcon, NSpace, NP, useNotification, NSwitch, NColorPicker, NScrollbar, NImage } from 'naive-ui'
import { ColorPaletteOutline, Images, Checkmark } from '@vicons/ionicons5'



import { useStore } from '@/store'
const store = useStore();
// console.log(store.llObj, '11111111111111');

setTimeout(() => {
    store.llObj = {
        a: 'aa',
        b: '数目'
    }
}, 1000);


const config = reactive({
    name: '背景配置项',
    visible: true,
    type: 1, //1 颜色 2 图片  3全景图
    // image: require("@/assets/image/model-bg-3.jpg"),
    viewImg: "/Bg/modelBG.jpg",
    color: "#000000",
});
const activeBackgroundId = ref(3);
const activeViewImageId = ref(3);

const optionsDisable = computed(() => {
    const { visible } = config;
    return visible ? "" : "disabled";
});
// const predefineColors = PREDEFINE_COLORS;
//切换类型
const onChangeType = (type) => {
    config.type = type;
    switch (type) {
        case 1:
            store.modelApi.onSetSceneColor(config.color);
            break;
        case 2:
            store.modelApi.onSetSceneImage(config.image);
            break;
        case 3:
            store.modelApi.onSetSceneViewImage(config.viewImg);
            break;
        default:
            break;
    }
};
//选择图片
const onChangeImage = ({ id, url }) => {
    config.image = url;
    activeBackgroundId.value = id;
    store.modelApi.onSetSceneImage(url);
};
//选择全景图
const onChangeViewImage = ({ id, url }) => {
    config.viewImg = url;
    activeViewImageId.value = id;
    store.modelApi.onSetSceneViewImage(url);
};
// 颜色面板值发生变化
const activeChangeColor = (color) => {

    config.color = color;
    store.modelApi.onSetSceneColor(config.color);
};
//选择颜色
const onChangeColor = (color) => {
    config.color = color;
    return store.modelApi.onSetSceneColor(config.color);
};

const onChangeBgSwitch = (value) => {

    console.log(config.visible);
    if (!value) {
        return store.modelApi.onSetSceneColor('#000')
    }


    // if (!visible) return state.modelApi.onSetSceneColor('#000');
    return
    const { type, visible, image, viewImg } = config;
    if (!visible) return state.modelApi.onSetSceneColor('#000');
    switch (type) {
        case 1:
            state.modelApi.onSetSceneColor(config.color);
            break;
        case 2:
            state.modelApi.onSetSceneImage(image);
            break;
        case 3:
            state.modelApi.onSetSceneViewImage(viewImg);
            break;
        default:
            break;
    }
};

defineExpose({
    config
});
</script>
<style lang="less" scoped>
.edit-box {
    // background-color: #33343f;
    color: #fff;

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

.options {

    // background-color: #fff;
    padding: 10px;
    border: 1px solid rgba(176, 176, 176, 0.412);

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
        box-sizing: border-box;
        cursor: pointer;
        margin-bottom: 4px;
    }

    .selectActive {
        border: 2px solid #18a058;
    }
}

.add-img {
    border: 1px dashed #414141;
    width: 180px;
    height: 78px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.img-privew {
    cursor: pointer;
    padding: 0px 26px;
}


.disabled {
    opacity: 0.3;
    pointer-events: none;
}

.el-view {
    width: 60px;
    height: 60px;
    cursor: pointer;
    margin-bottom: 8px;
}
</style>
  