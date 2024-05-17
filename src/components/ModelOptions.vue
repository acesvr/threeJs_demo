<template>
    <div class="LLoption" oncontextmenu='return false'>
        <div class="LLoptionItem" style="padding-bottom: 60px;">
            <div class="LLoptionTitle">
                模型信息
            </div>
            <div class="LLmodelInfo">
                模型名称：{{ fileName }}
            </div>
        </div>
        <hr>
        <div class="LLoptionItem">
            <div class="LLoptionTitle">
                上传模型
            </div>
            <div class="uploadBtn">
                <n-upload directory-dnd :action="actionUrl" @finish="overUpload" @before-upload="beforeUpload"
                    :file-list-style="{ display: 'none' }">
                    <n-upload-dragger>
                        <div style="margin-bottom: 12px">
                            <n-icon size="48" :depth="3" color="#fff">
                                <archive-outline />
                            </n-icon>
                        </div>
                        <!-- <n-text style="font-size: 14px;color: #fff;">
                            拖动到该区域
                        </n-text> -->
                        <n-p depth="3" style="margin: 8px 0 0 0">
                            支持 fbx/glb/gltf 
                            不要包含中文名
                        </n-p>
                    </n-upload-dragger>
                </n-upload>
            </div>
        </div>
        <div class="LLoptionItem">
            <div class="LLoptionTitle">
                上传贴图
            </div>
            <div class="uploadBtn">
                <n-upload directory-dnd :action="actionUrl" @finish="overUpload_map" @before-upload="beforeUpload_map"
                    :file-list-style="{ display: 'none' }" multiple :max="10">
                    <n-upload-dragger>
                        <div style="margin-bottom: 12px">
                            <n-icon size="48" :depth="3" color="#fff">
                                <Images />
                            </n-icon>
                        </div>
                        <n-text style="font-size: 14px;color: #fff;">
                            拖动到该区域
                        </n-text>
                     
                    </n-upload-dragger>
                </n-upload>
            </div>
        </div>
        <hr>
        <div class="LLBtn">
            <n-button size="tiny" type="info" @click="saveModelOptions">
                保存场景模型
            </n-button>

            <div>
                <n-button size="tiny" type="info" @click="export_glb" disabled>
                    导出为glb
                </n-button>
            </div>

            <div>
                <n-button size="tiny" type="info" @click="clearScene">
                    清空场景缓存
                </n-button>
            </div>
        </div>

    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, defineEmits, watch } from 'vue';
import { ArchiveOutline, Images } from '@vicons/ionicons5'
import { NUpload, NButton, NUploadDragger, NText, NIcon, NP, useNotification } from 'naive-ui'
import { useMessage } from "naive-ui";
import { getFileType } from "@/utils/utilityFunction.js";
import { useStore } from '@/store'

const env = import.meta.env
const store = useStore();

//定义要发送的emit事件
const emit = defineEmits(['handleOkUpload', 'handleSaveModelOptions', 'playAni', 'export_glb'])

const actionUrl = env.VITE_BASE_API + "api/uploadimg"

const isUploaded = ref(false)

const message = useMessage();

const fileName = ref("空")
const overUpload = async ({ file }) => {
    message.success(
        "模型上传成功! 预览loading..."
    );


    fileName.value = file.name
    // emit('handleOkUpload', file.name)

    const model = {
        filePath: file.fullPath,
        fileType: getFileType(file.name),
        ModelName: file.name,
        fileSize: file.file.size
    };
    try {
        store.modelApi_name = file.name
        // await store.modelApi.onSwitchModel(model);
        await store.modelApi.addModelToScene(model);
    } catch (err) {
        console.log('切换失败,注意文件名不要包含中文');
    }
}

const beforeUpload = (data) => {
    // if (!data.file.name.endsWith('.fbx')) {
    //     message.error("目前仅支持上传.fbx格式的模型文件，请重新上传");
    //     return false;
    // }
    // console.log(data.file);
    // console.log(store.modelList);
    // return false;
    return true;
}




const overUpload_map = ({ file }) => {
    message.success(
        "贴图上传成功! "
    );
    console.log(file.name);
}
const beforeUpload_map = (data) => {

    if (!data.file.name.endsWith('.png') && !data.file.name.endsWith('.jpg')) {
        message.error("目前仅支持上传.png、.jpg格式的贴图文件，请重新上传");
        return false;
    }
    return true;
}
let isThrottled = false;
// 保存配置项saveModelOptions
const saveModelOptions = ({ }) => {
    if (!isThrottled) {
        isThrottled = true;
        let tempStorage = [];

        // store.modelMaterialList.forEach(item => {
        //     delete item.userData.initialMaterial;
        //     tempStorage.push(item.userData)
        // });
        // console.log(tempStorage);

        // let NewMaterial = store.modelApi.saveUserNewMaterial()
        localStorage.setItem('showModel', store.modelApi_name)
        let SceneModels = [];
        let cameraPosition = {
            x: store.modelApi.camera.position.x,
            y: store.modelApi.camera.position.y,
            z: store.modelApi.camera.position.z,
        }

        // console.log('相机位置:', cameraPosition);
        let systemSetting = {
            cameraPosition: cameraPosition,
            GridHelperIsOpen: store.modelApi.gridHelper.visible
        };
        localStorage.setItem('systemSetting', JSON.stringify(systemSetting));

        store.modelList.forEach(item => {
            tempStorage = item.MaterialList

            // for (let i = 0; i < tempStorage.length; i++) {
            //     delete tempStorage[i].initialMaterial; //删除 userData.initialMaterial，不然localStorage存不下(加载模型时会重新保存)
            // }

            console.log(tempStorage);


            let obj = store.modelApi.getObjectById(item.id);
            SceneModels.push({
                name: obj.name,
                ModelName: obj.ModelName,
                MaterialList: tempStorage,// 这个模型的全部材质userData
                setting: {
                    visible: obj.visible,
                    position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                    scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
                    position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                    rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z }
                },// 这个模型的缩放等
            })
        });

        console.log(SceneModels);
        localStorage.setItem('SceneModels', JSON.stringify(SceneModels));
        // localStorage.setItem(store.modelApi_name, JSON.stringify(tempStorage));
        // localStorage.setItem(store.modelApi_name + 'NewMaterial', JSON.stringify(NewMaterial));

        message.success(
            "配置已保存 下次进入自动加载;若出现错误请清除localStorage重新进入。"
        );
        setTimeout(() => {
            isThrottled = false;
        }, 1000); // 设置节流时间，这里是1秒
    }
}

const export_glb = ({ }) => {
    message.warning("(export_glb)loading...");

    store.modelApi.export_glb()
}

const clearScene = () => {
    localStorage.clear();
    message.success("缓存数据清理完毕,请刷新页面");
}
</script>
<style scoped lang="less">
.LLoption {
    // border: 1px solid red;
    box-sizing: border-box;

    width: 180px;
    min-width: 200px;
    padding: 0 20px;
    height: 100%;
    background-color: #1b1c23;
    color: aliceblue;
    user-select: none;
    /** 禁用右键菜单 */

    user-select: none;

    .LLoptionItem {
        padding-bottom: 10px;

        .LLoptionTitle {
            font-size: 1.2rem;
            font-weight: 600;
            text-align: center;
            padding-bottom: 10px;
        }

        .LLmodelInfo {
            // background-color: red;
            font-size: 1rem;
        }

        :deep(.n-upload-dragger) {
            background-color: rgba(0, 0, 0, 0);
        }

        :deep(.n-upload-file-info__name) {
            color: #adadad;
        }
    }
}
</style>
  