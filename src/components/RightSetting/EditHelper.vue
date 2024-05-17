<template>
    <div class="edit-box">
        <div class="header">
            <div class="headerTitle">AxesHelper</div>
            <n-switch v-model:value="config.axesHelper" @update:value="axesHelperChangeOpen" />
        </div>
        <div class="options" :class="axesHelperDisabled">
            <!-- 光源距离 -->
            <div class="option" :class="axesHelperDisabled">
                <div class="grid-txt">
                    <n-button type="primary" quaternary>size</n-button>
                </div>
                <div class="grid-silder">
                    <n-slider v-model:value="config.axesHelperSize" @update:value="onChangeHelper" :min="1" :max="100"
                        :step="1" />
                </div>
            </div>
        </div>
        <div class="header">
            <div class="headerTitle">gridHelper</div>
            <n-switch v-model:value="config.gridHelper" @update:value="gridHelperChangeOpen" />
        </div>
        <div class="options" :class="gridHelperDisabled">
            <div class="option">
                <div class="grid-txt">
                    <n-button type="primary" quaternary>size</n-button>
                </div>
                <div class="action">
                    <n-input-number v-model:value="config.gridHelperSize" @update:value="gridHelperChangeOpen" size="tiny"
                        button-placement="both" style="text-align: center;width: 100px;" step="10" :min="1" :max="100" />
                </div>
            </div>
            <div class="option">
                <div class="grid-txt">
                    <n-button type="primary" quaternary>divisions</n-button>
                </div>
                <div class="action">
                    <n-input-number v-model:value="config.gridHelperDivisions" @update:value="gridHelperChangeOpen"
                        size="tiny" button-placement="both" style="text-align: center;width: 100px;" step="10" :min="1"
                        :max="100" />
                </div>
            </div>
        </div>
        <div class="options" :class="gridHelperDisabled">
            <div class="option">
                <div class="grid-txt">
                    <n-button type="primary" quaternary>color</n-button>
                </div>
                <div class="action">
                    <n-color-picker size="small" :show-alpha="false" :modes="['hex']" :swatches="[
                        '#FFFFFF',
                        '#18A058',
                        '#2080F0',
                        '#F0A020'
                    ]" @update:value="gridHelperChangeColor" v-model:value="config.colorCenterLine" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { NInputNumber, NButton, NSelect, NText, NIcon, NSpace, NP, NSlider, NSwitch, NColorPicker } from 'naive-ui'
import { ColorPaletteOutline, Images, Checkmark, EyeOutline, EyeOffOutline } from '@vicons/ionicons5'
import { useStore } from '@/store'
const store = useStore();


const config = reactive({
    id: 11,
    name: '2222',
    //空间辅助线
    axesHelper: true,
    axesHelperSize: 30,

    //网格辅助线
    gridHelper: false,
    gridHelperSize: 60,
    gridHelperDivisions: 20,
    colorCenterLine: "#18A058",
});


let systemSetting = JSON.parse(localStorage.getItem('systemSetting'));
if (systemSetting && systemSetting.GridHelperIsOpen) {
    config.gridHelper = true
}

// 轴辅助线 >> --------------------------------
const axesHelperChangeOpen = (bool) => {
    store.modelApi.onSetModelAxesHelper({ axesHelper: bool, axesSize: config.axesHelperSize });
}
const onChangeHelper = (num) => {
    store.modelApi.onSetModelAxesHelper({ axesSize: num });
};

const axesHelperDisabled = computed(() => {
    return config.axesHelper ? "" : "disabled";
});
// 轴辅助线end << --------------------------------

// 网格辅助线 >> --------------------------------
const gridHelperChangeOpen = (bool) => {
    // console.log('网格：', bool);
    store.modelApi.onSetModelGridHelper({
        gridHelper: bool,
        gridSize: config.gridHelperSize,
        gridDivisions: config.gridHelperDivisions,
        colorCenterLine: config.colorCenterLine
    });
}
const gridHelperChangeColor = (color) => {
    config.colorCenterLine = color;
    store.modelApi.onSetModelGridHelper({
        gridHelper: config.gridHelper,
        gridSize: config.gridHelperSize,
        gridDivisions: config.gridHelperDivisions,
        colorCenterLine: config.colorCenterLine
    });
};

const gridHelperDisabled = computed(() => {
    return config.gridHelper ? "" : "disabled";
});
// 网格辅助线end << --------------------------------
onMounted(() => {

});
onUnmounted(() => {

});
</script>

<style scoped lang="less">
.edit-box {
    // background-color: #33343f;
    color: #fff;
    user-select: none;


    .header {
        background-color: #33343f;
        height: 40px;
        font-size: 16px;
        display: flex;
        align-items: center;
        padding: 0 20px;

        .headerTitle {
            flex: 1;
        }
    }


    .options {
        padding: 2px;
        border-bottom: 1px solid rgba(176, 176, 176, 0.412);
        user-select: none;
        display: flex;

        .option {
            display: flex;
            align-items: center;
            box-sizing: border-box;
            padding: 2px 10px 2px 0;
            width: 100%;

            .icon-name {
                height: 100%;
                display: flex;
                // align-items: end;
                padding-top: 6px;

            }

            .action {
                width: 100%;
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
}

.disabled {
    opacity: 0.5;
    pointer-events: none;
}
</style>
