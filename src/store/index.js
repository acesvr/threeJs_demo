
import { defineStore, storeToRefs } from 'pinia'

export const useStore = defineStore('main', {
    state: () => {
        return {
            name: '第1个sotre',

            modelApi: {},  //当前模型

            modelApi_name: '',    // 当前模型name

            selectMaterial: {},     //当前选中材质

            selectMesh: {},    // 当前选中网格
            selectMesh_materialName: '', // 当前选中网格的<材质>的名字



            modelList: [],//所有由用户添加到场景的模型
            selectModel: {},    // 当前选中模型
            selectModel_Id: '', // 当前选中模型的ID
            selectModel_Name: '', // 当前选中模型的名字



            // 网格列表
            modelMeshList: [],


            // 材质列表(包括下边的newMaterial)
            modelMaterialList: [],

            // 用户新增的材质列表
            newMaterial: [],


            showLoading: false,//loading弹窗
            L_Loading_Url: '',
            L_Loading_Loaded: 0,
            L_Loading_Total: 0,
            showProgress: true,//显示加载页的百分百进度



            // 勿动
            llObj: {
                a: 'a',
                b: null
            }
        }
    },
    getters: {
        selectMeshUuid: (state) => state.selectMesh.uuid,
        getMlist: (state) => {
            let aa = [{ label: '那么', value: 2 }]
            return aa
        }
    },
    // mutations: {
    //     SET_MODEL_API: (state, modelApi) => {
    //         state.modelApi = modelApi
    //     },
    //     SELECT_MESH: (state, selectMesh) => {
    //         state.selectMesh = selectMesh
    //     }
    // },
    actions: {
    },
    modules: {
    },
    getters: {},
    actions: {}
})


