<template>
    <div class="edit-box">
        <div class="header_l">
            <n-button type="primary" quaternary>所属模型</n-button>
            <n-select v-model:value="pageSelectModel_Id" :options="modelListArr" @update:value="change_SelectModel"
                size="tiny" style="width: 200px" />
        </div>
        <div class="header">
            <div class="headerTitle">材质列表
                <n-button strong secondary type="primary" size="tiny" @click="addNewMaterial" disabled>
                    新增材质
                </n-button>
            </div>
            {{ store.llObj.b }}
            <!-- {{ state.modelApi.id }} -->
            {{ MaterialList_LL ? MaterialList_LL.length : '？' }}
        </div>
        <!-- 材质列表 -->
        <div class="M_Lists">
            <div class="M_List" @click="onChangeMaterial(material)" v-for="material in MaterialList_LL"
                :key="material.uuid">
                <n-icon size="18" color="#409eff">
                    <ExtensionPuzzleOutline />
                </n-icon>
                <div class="M_List_name">
                    {{ material.name }} --
                    {{ material.id }}
                </div>
                <div class="check" v-show="store.selectMaterial.name == material.name">
                    <n-icon size="20px" color="#2a3ff6">
                        <Checkmark />
                    </n-icon>
                </div>
            </div>

            <div class="M_List addNewM" style="cursor: default;" v-show="addNewMaterialShow">
                <n-icon size="18" color="#409eff">
                    <PencilSharp />
                </n-icon>
                <div class="M_List_name">
                    <n-input ref="inputInstRef" v-model:value="addNewMaterialValue" size="tiny"
                        :allow-input="onlyNumAndEnglish" type="text" placeholder="输入自定义材质名" />
                </div>

                <n-icon size="24" color="#e63f32" @click="closeNewName" style="cursor: pointer;">
                    <CloseCircleOutline />
                </n-icon>

                <n-icon size="24" color="#18a058" @click="okNewName" style="cursor: pointer;">
                    <CheckmarkCircleOutline />
                </n-icon>
            </div>
        </div>

        <div class="header">
            <div class="headerTitle" @click="lllGo">材质属性</div>
            {{ store.selectMaterial.name }}
        </div>
        <div v-if="store.selectMaterial.name">
            <div class="options">
                <div class="option">
                    <div class="icon-name">
                        <n-space>
                            <n-icon size="22px">
                                <ColorPaletteOutline />
                            </n-icon>
                            <span> 材质类型：</span>
                        </n-space>
                    </div>
                    <div class="action">
                        <n-select v-model:value="store.selectMaterial.userData.type" :options="meshTypeList"
                            @update:value="change_material_type" size="tiny" style="width: 200px" />
                    </div>
                </div>
            </div>
            <div class="options">
                <div class="option">
                    <div class="icon-name">
                        <n-space>
                            <n-icon size="22px">
                                <ColorPaletteOutline />
                            </n-icon>
                            <span> 渲染面：</span>
                        </n-space>
                    </div>
                    <div class="action">
                        <n-select v-model:value="store.selectMaterial.userData.side" :options="meshSideList"
                            @update:value="onChangeSide_M" size="tiny" style="width: 200px" />
                    </div>
                </div>
            </div>
            <div class="options">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>
                                <span> 材质颜色：</span>
                            </n-space>
                        </div>
                        <div class="action">
                            <n-color-picker size="small" :show-alpha="false" :modes="['hex']" :swatches="[
                                '#FFFFFF',
                                '#18A058',
                                '#2080F0',
                                '#F0A020'
                            ]" @update:value="onChangeColor_M" v-model:value="store.selectMaterial.userData.color" />
                        </div>
                    </n-space>
                </div>
            </div>
            <div class="options">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>
                                <span> 透明度：</span>
                            </n-space>
                        </div>
                        <div class="action">
                            <n-slider v-model:value="store.selectMaterial.userData.opacity" :min="0" :max="1" :step="0.1"
                                @update:value="onChangeOpacity_M" />
                            {{ store.selectMaterial.transparent }}
                        </div>
                    </n-space>
                </div>
            </div>
            <div class="options"
                v-if="store.selectMaterial.userData.type == 'MeshPhysicalMaterial' || store.selectMaterial.userData.type == 'MeshStandardMaterial'">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>
                                <span> 金属度：</span>
                            </n-space>
                        </div>
                        <div class="action">
                            <n-slider v-model:value="store.selectMaterial.userData.metalness" :min="0" :max="1" :step="0.1"
                                @update:value="onChangeMetalness_M" />
                        </div>
                    </n-space>
                </div>
            </div>
            <div class="options"
                v-if="store.selectMaterial.userData.type == 'MeshPhysicalMaterial' || store.selectMaterial.userData.type == 'MeshStandardMaterial'">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>
                                <span> 粗糙度： </span>
                            </n-space>
                        </div>
                        <div class="action">
                            <n-slider v-model:value="store.selectMaterial.userData.roughness" :min="0" :max="1" :step="0.1"
                                @update:value="onChangeRoughness_M" />
                        </div>
                    </n-space>
                </div>
            </div>
            <div class="options" v-if="store.selectMaterial.userData.type == 'MeshPhysicalMaterial'">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>

                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <span> ior:</span>
                                    </template>
                                    为非金属材质所设置的折射率，范围由1.0到2.333。默认为1.5。
                                </n-tooltip>

                            </n-space>
                        </div>
                        <div class="action">
                            <n-slider v-model:value="store.selectMaterial.userData.ior" :min="1" :max="2.333" :step="0.1"
                                @update:value="onChangeIor_M" />
                        </div>
                    </n-space>
                </div>
            </div>
            <div class="options" v-if="store.selectMaterial.userData.type == 'MeshPhysicalMaterial'">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>

                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <span> reflectivity:</span>
                                    </template>
                                    非金属材质的反射率。当metalness为1.0时，此属性无效。
                                </n-tooltip>

                            </n-space>
                        </div>
                        <div class="action">
                            <n-slider v-model:value="store.selectMaterial.userData.reflectivity" :min="0" :max="1"
                                :step="0.1" @update:value="onChangeReflectivity_M" />
                        </div>
                    </n-space>
                </div>
            </div>
            <div class="options" v-if="store.selectMaterial.userData.type == 'MeshPhysicalMaterial'">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>

                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <span> sheen:</span>
                                    </template>
                                    光泽层的强度
                                </n-tooltip>

                            </n-space>
                        </div>
                        <div class="action">
                            <n-slider v-model:value="store.selectMaterial.userData.sheen" :min="0" :max="1" :step="0.1"
                                @update:value="onChangeSheen_M" />
                        </div>
                    </n-space>
                </div>
            </div>
            <div class="options" v-if="store.selectMaterial.userData.type == 'MeshPhysicalMaterial'">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>

                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <span>sheenRoughness:</span>
                                    </template>
                                    光泽层的粗糙度
                                </n-tooltip>

                            </n-space>
                        </div>
                        <div class="action">
                            <n-slider v-model:value="store.selectMaterial.userData.sheenRoughness" :min="0" :max="1"
                                :step="0.1" @update:value="onChangeSheenRoughness_M" />
                        </div>
                    </n-space>
                </div>
            </div>
            <div class="options" v-if="store.selectMaterial.userData.type == 'MeshPhongMaterial'
                || store.selectMaterial.userData.type == 'MeshPhysicalMaterial'
                || store.selectMaterial.userData.type == 'MeshStandardMaterial'">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>

                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <span> emissive:</span>
                                    </template>
                                    材质的放射（光）颜色
                                </n-tooltip>

                            </n-space>
                        </div>
                        <div class="action">
                            <n-color-picker size="small" :show-alpha="false" :modes="['hex']" :swatches="[
                                '#FFFFFF',
                                '#18A058',
                                '#2080F0',
                                '#F0A020'
                            ]" @update:value="onChangeEmissive_M"
                                v-model:value="store.selectMaterial.userData.emissive" />

                        </div>
                    </n-space>
                </div>
            </div>
            <div class="options" v-if="store.selectMaterial.userData.type == 'MeshPhongMaterial'
                || store.selectMaterial.userData.type == 'MeshPhysicalMaterial'
                || store.selectMaterial.userData.type == 'MeshStandardMaterial'">
                <div class="option">
                    <n-space>
                        <div class="icon-name">
                            <n-space>
                                <n-icon size="22px">
                                    <ColorPaletteOutline />
                                </n-icon>

                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <span> emissiveIntensity:</span>
                                    </template>
                                    放射光强度
                                </n-tooltip>

                            </n-space>
                        </div>
                        <div class="action">
                            <n-slider v-model:value="store.selectMaterial.userData.emissiveIntensity" :min="0" :max="5"
                                :step="0.1" @update:value="onChangeEmissiveIntensity_M" />
                        </div>
                    </n-space>
                </div>
            </div>
        </div>
        <div v-if="store.selectMaterial.name">
            <div class="header">
                <div class="headerTitle">材质贴图</div>
            </div>
            <div class="options">
                <n-image-group>
                    <n-space>
                        <n-image :class="item.path == store.selectMaterial.userData.map ? 'mapImg_active' : 'mapImg'"
                            v-for="(item, index) in mapResObj.value" :key="index" width="50" preview-disabled
                            :src="item.path" @click="onChangeMap_M(item)" />
                    </n-space>
                </n-image-group>

                <!-- {{ mapResObj }} -->
                <!-- <n-scrollbar style="height: 200px">
            </n-scrollbar> -->
            </div>
        </div>

    </div>
</template>
<script setup>
import * as THREE from 'three' //导入整个 three.js核心库
import axios from 'axios';

import { ref, reactive, computed, onMounted, onUnmounted, watch, watchEffect } from "vue";
import { meshTypeList, meshSideList } from "@/config/constant";
import { backgrundList } from "@/config/model.js";
import { NInput, NButton, NSelect, NText, NIcon, NSpace, NTooltip, NSlider, NSwitch, NColorPicker, NScrollbar, NImageGroup, NImage } from 'naive-ui'
import { ColorPaletteOutline, Images, Checkmark, EyeOutline, EyeOffOutline, CheckmarkCircleOutline, CloseCircleOutline, PencilSharp, ExtensionPuzzleOutline } from '@vicons/ionicons5'


import { useMessage } from "naive-ui";
import { storeToRefs } from 'pinia'
import { useStore } from '@/store'
const store = useStore();


// list
var MaterialList_LL = []
watchEffect(() => {
    if (store.selectModel_Id) {
        MaterialList_LL = store.modelMaterialList
        // console.log('材质列表已更新');
    }
})
// list-end


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

const lllGo = () => {
    console.log(store.selectMaterial);
}


const message = useMessage();
const config = reactive({
    name: '当前材质的config',
    meaterialName: null,
    color: null,
    wireframe: false,
    depthWrite: true,
    opacity: 1,
});
// const config = reactive({
//     MeshMatcapMaterial:{
//     }
// });

// const userData = computed(() => {
//     return store.modelApi.modelMaterialList.find(v => v.name == selectMaterial.value.name).userData || {}
// });
const mapResObj = reactive({});

const env = import.meta.env
const getMap = () => {
    axios.get(env.VITE_BASE_API + 'api/getMap').then(res => {
        if (res.status == 200) {
            mapResObj.value = res.data
        }
    })
}


onMounted(async () => {
    getMap();


})
// 设置材质显隐
const onSetMeshVisibe = (material) => {
    material.visible = !material.visible
}
// 选择材质
const onChangeMaterial = (material) => {
    const activeMaterial = store.modelApi.onChangeModelMeaterial(material);

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
// // 选择网格
// const onChangeMaterialType2 = ({ name, id, material, mapId }) => {
//     config.meaterialName = material.name;
//     const activeMesh = store.modelApi.onChangeModelMeaterial(name);
//     const { color, wireframe, depthWrite, opacity } = activeMesh.material;
//     Object.assign(config, {
//         color: new THREE.Color(color).getStyle(),
//         wireframe,
//         depthWrite,
//         opacity,
//     });



// };

// 改变材质类型 ①①①①①①①①①①①①①①①①①
const change_material_type = (type) => {
    // if (store.selectMaterial.userData.type == type) {
    //     return
    // }
    // store.selectMaterial.userData.type = type
    console.log(store.selectMaterial.userData);
    if (type == 'MeshMatcapMaterial') {
        store.selectMaterial.userData = {
            ...store.selectMaterial.userData,
            type: 'MeshMatcapMaterial',
            name: store.selectMaterial.name,
            map: store.selectMaterial.userData.map || null,
            opacity: store.selectMaterial.opacity || store.selectMaterial.opacity == 0 ? store.selectMaterial.opacity : 1,
            side: store.selectMaterial.side || 0,
            color: "#" + store.selectMaterial.color.getHex().toString(16) || '#000000',

        }
    } else if (type == 'MeshPhysicalMaterial') {
        store.selectMaterial.userData = {
            ...store.selectMaterial.userData,
            type: 'MeshPhysicalMaterial',
            name: store.selectMaterial.name,
            opacity: store.selectMaterial.opacity || store.selectMaterial.opacity == 0 ? store.selectMaterial.opacity : 1,
            side: store.selectMaterial.side || 0,
            map: store.selectMaterial.userData.map || null,
            color: "#" + store.selectMaterial.color.getHex().toString(16) || '#000000',
            metalness: store.selectMaterial.metalness || store.selectMaterial.userData.metalness || 0,
            roughness: store.selectMaterial.roughness || store.selectMaterial.roughness == 0 ? store.selectMaterial.roughness : 1,
            ior: store.selectMaterial.ior || 1.5,
            reflectivity: store.selectMaterial.reflectivity || store.selectMaterial.reflectivity === 0 ? store.selectMaterial.reflectivity : 0.5,
            sheen: store.selectMaterial.sheen || 0,
            sheenRoughness: store.selectMaterial.sheenRoughness || 1,
        }
    } else if (type == 'MeshStandardMaterial') {
        store.selectMaterial.userData = {

            ...store.selectMaterial.userData,
            type: 'MeshStandardMaterial',
            name: store.selectMaterial.name,
            opacity: store.selectMaterial.opacity || store.selectMaterial.opacity == 0 ? store.selectMaterial.opacity : 1,
            side: store.selectMaterial.side || 0,
            map: store.selectMaterial.userData.map || null,
            color: "#" + store.selectMaterial.color.getHex().toString(16) || '#000000',
            metalness: store.selectMaterial.metalness || store.selectMaterial.userData.metalness || 0,
            roughness: store.selectMaterial.roughness || store.selectMaterial.roughness == 0 ? store.selectMaterial.roughness : 1,
            ior: store.selectMaterial.ior || 1.5,
            reflectivity: store.selectMaterial.reflectivity || store.selectMaterial.reflectivity === 0 ? store.selectMaterial.reflectivity : 0.5,

        }
    } else if (type == 'MeshPhongMaterial') {
        store.selectMaterial.userData = {
            ...store.selectMaterial.userData,
            type: 'MeshPhongMaterial',
            name: store.selectMaterial.name,
            opacity: store.selectMaterial.opacity || store.selectMaterial.opacity == 0 ? store.selectMaterial.opacity : 1,
            side: store.selectMaterial.side || 0,
            map: store.selectMaterial.userData.map || null,
            color: "#" + store.selectMaterial.color.getHex().toString(16) || '#000000',

        }
    }

    // store.selectMaterial.userData.color = "#" + store.selectMaterial.color.getHex().toString(16);
    // store.selectMaterial.userData.opacity = store.selectMaterial.opacity;
    store.modelApi.onChangeModelMeshType(type);
    // console.log(store.selectMaterial);
    // console.log(store.selectMaterial.userData);
    return
    let mo = store.modelList.find(i => i.id == store.selectModel_Id)
    console.log(mo.MaterialList);

    console.log(store.selectMaterial.userData);
}


const onChangeSide_M = (side) => { store.modelApi.onSetMaterial_Physical({ side }) };
const onChangeColor_M = (color) => { store.modelApi.onSetMaterial_Physical({ color }) };
const onChangeOpacity_M = (opacity) => { store.modelApi.onSetMaterial_Physical({ opacity }) };
const onChangeMetalness_M = (metalness) => { store.modelApi.onSetMaterial_Physical({ metalness }) }; // 改变材质粗糙度
const onChangeRoughness_M = (roughness) => { store.modelApi.onSetMaterial_Physical({ roughness }) };
const onChangeIor_M = (ior) => { store.modelApi.onSetMaterial_Physical({ ior }) };
const onChangeReflectivity_M = (reflectivity) => { store.modelApi.onSetMaterial_Physical({ reflectivity }) };
const onChangeSheen_M = (sheen) => { store.modelApi.onSetMaterial_Physical({ sheen }) };
const onChangeSheenRoughness_M = (sheenRoughness) => { store.modelApi.onSetMaterial_Physical({ sheenRoughness }) };


// phong网格材质
const onChangeEmissive_M = (emissive) => { store.modelApi.onSetMaterial_Physical({ emissive }) };
const onChangeEmissiveIntensity_M = (emissiveIntensity) => { store.modelApi.onSetMaterial_Physical({ emissiveIntensity }) };

// 改变贴图
const onChangeMap_M = (item) => {
    store.modelApi.onSetMaterialMap(item.path)
}




// 新增自定义材质
const addNewMaterialShow = ref(false)

const inputInstRef = ref(null);
const addNewMaterialValue = ref('')
const onlyNumAndEnglish = (value) => !value || /^[0-9a-zA-Z]+$/.test(value);
const addNewMaterial = () => {
    addNewMaterialShow.value = true;
    setTimeout(() => {
        inputInstRef.value?.focus();
    }, 600);
}
const okNewName = () => {
    if (!addNewMaterialValue.value || addNewMaterialValue.value.length > 15) {
        message.warning(
            "不可为空或过长!"
        );
    } else {
        if (store.modelMaterialList.some(i => i.name == addNewMaterialValue.value)) {
            message.warning(
                "当前名称与已存在材质名称重复!"
            );
        } else {
            store.newMaterial.push({
                MaterialName: addNewMaterialValue.value,
                user: [],//使用者(mesh)
            })
            // 新建材质
            let newM = new THREE.MeshMatcapMaterial({
                color: new THREE.Color('#cccccc'),
                name: addNewMaterialValue.value,
                opacity: 1,
                map: null
            })
            newM.transparent = true;
            newM.userData.type = 'MeshMatcapMaterial';
            newM.userData.color = '#cccccc';
            newM.userData.opacity = 1;
            newM.userData.name = addNewMaterialValue.value;
            store.modelMaterialList.push(newM);
            closeNewName()
        }
    }
}
const closeNewName = () => {
    addNewMaterialShow.value = false;
    addNewMaterialValue.value = ''
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
    max-height: 300px;
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
    padding: 0px;
    border-bottom: 1px solid rgba(176, 176, 176, 0.4);
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
            min-width: 150px;
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
  