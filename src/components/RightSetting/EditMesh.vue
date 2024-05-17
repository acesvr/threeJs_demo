<template>
    <div class="edit-box">
        <div class="header_l">
            <n-button type="primary" quaternary>所属模型</n-button>
            <n-select v-model:value="pageSelectModel_Id" :options="modelListArr" @update:value="change_SelectModel"
                size="tiny" style="width: 200px" />
        </div>

        <div class="header">
            <div class="headerTitle">网格列表</div>
            {{ store.llObj.b }}
            {{ store.modelMeshList ? store.modelMeshList.length : '？' }}
        </div>
        <!-- 材质列表 -->
        <div class="M_Lists">
            <div class="M_List" @click="onChangeSelectMesh(mesh)" v-for="mesh in store.modelMeshList" :key="mesh.uuid">
                <n-icon @click="onSetMeshVisibe(mesh)" size="18" color="#409eff" v-if="mesh.visible">
                    <EyeOutline />
                </n-icon>
                <n-icon size="18" @click="onSetMeshVisibe(mesh)" v-else>
                    <EyeOffOutline />
                </n-icon>
                <div class="M_List_name">
                    {{ mesh.name }} --
                    {{ mesh.id }}
                </div>

                <div class="check" v-show="store.selectMesh.name == mesh.name">
                    <n-icon size="20px" color="#2a3ff6">
                        <Checkmark />
                    </n-icon>
                </div>
            </div>
        </div>
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
                    <n-select v-model:value="store.selectMesh_materialName" :disabled="!store.selectMesh.name"
                        :options="meshUseMaterialList" @update:value="change_material_use" size="tiny"
                        style="width: 200px" />
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
import { NUpload, NButton, NSelect, NText, NIcon, NSpace, NP, NSlider, NSwitch, NColorPicker, NScrollbar, NImageGroup, NImage } from 'naive-ui'
import { ColorPaletteOutline, Images, Checkmark, EyeOutline, EyeOffOutline } from '@vicons/ionicons5'


import { storeToRefs } from 'pinia'
import { useStore } from '@/store'
const store = useStore();

// 所属模型start-------------------------------------------------
const pageSelectModel_Id = ref('');
watchEffect(() => {
    if (store.selectModel_Name) {
        pageSelectModel_Id.value = store.selectModel_Id;
    }
})

var modelListArr = []
watch(() => store.modelList, (newV, oldV) => {
    if (newV) {
        let tempArr = []
        newV.forEach(item => {
            tempArr.push({
                label: item.ModelName + ' - ' + item.id,
                value: item.id
            })
        });
        modelListArr = tempArr
    }
}, {
    deep: true
});



const change_SelectModel = (id) => {
    if (id != store.selectModel_Id) {
        store.modelApi.setNowModel({ id });
    }
}
// end所属模型-------------------------------------------------

// 监听变化
watch(() => store.modelMaterialList, (newV, oldV) => {
    // console.log(newV, oldV);
    let tempArr = []
    newV.forEach(item => {
        tempArr.push({
            label: item.name,
            value: item.name
        })
    });

    meshUseMaterialList = tempArr
}, {
    deep: true
});
var meshUseMaterialList = []
// const meshUseMaterialList = computed(() => {
//     return store.modelApi.modelMaterialList.find(v => v.name == selectMaterial.value.name).userData || {}
//     // return store.modelMaterialsOptions.find(v => v.name == selectMaterial.value.name)
// });
const mapResObj = reactive({});


onMounted(async () => {

})
// 设置材质显隐
const onSetMeshVisibe = (mesh) => {
    mesh.visible = !mesh.visible
}
// 选择mesh
const onChangeSelectMesh = (mesh) => {
    // console.log(mesh);

    store.modelApi.onChangeModelMesh(mesh);
    store.selectMesh_materialName = mesh.material.name;



    // { name, id, material, mapId }
    // return
    // config.meaterialName = material.name;
    // const activeMesh = store.modelApi.onChangeModelMeaterial(name);
    // const { color, wireframe, depthWrite, opacity } = activeMesh.material;
    // Object.assign(config, {
    //     color: new THREE.Color(color).getStyle(),
    //     wireframe,
    //     depthWrite,
    //     opacity,
    // });
};


// 改变所属材质
const change_material_use = (value) => {

    // console.log(store.selectMesh.name, value);

    store.modelApi.change_material_use(store.selectMesh.name, value);
    // console.log(selectMesh);
}




</script>
<style lang="less" scoped>
.edit-box {
    // background-color: #33343f;
    color: #fff;
    user-select: none;


    .header_l {
        background-color: #33343f;
        height: 45px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #4ec9b0;
    }

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
  