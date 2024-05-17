import * as THREE from 'three' //导入整个 three.js核心库
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' //导入控制器模块，轨道控制器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader' //导入GLTF模块，模型解析器,根据文件格式来定
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter'
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { vertexShader, fragmentShader } from '@/config/constant.js'
// import { lightPosition, onlyKey } from '@/utils/utilityFunction'

// 引入GPU相关
// import WebGPU from 'three/addons/capabilities/WebGPU.js';
// import WebGL from 'three/addons/capabilities/WebGL.js';

// import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

// import { useMessage } from "naive-ui";
// const message = useMessage();
import TWEEN from "@tweenjs/tween.js";

import { useStore } from '@/store'
const store = useStore();

class renderModel {
    constructor(selector) {
        this.container = document.querySelector(selector)
        // 相机
        this.camera
        // 场景
        this.scene
        //渲染器
        this.renderer
        // 控制器
        this.controls
        // 模型
        this.model
        // 几何体模型数组
        this.geometryGroup = new THREE.Group()
        // 几何体模型
        this.geometryModel
        // 加载进度监听
        this.loadingManager = new THREE.LoadingManager()
        //文件加载器类型
        this.fileLoaderMap = {
            'glb': new GLTFLoader(this.loadingManager),
            'fbx': new FBXLoader(this.loadingManager),
            'gltf': new GLTFLoader(this.loadingManager),
            'obj': new OBJLoader(this.loadingManager),
        }
        this.loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
            store.showProgress = false;
            store.showLoading = true;
        };
        this.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
            store.L_Loading_Url = url;
            store.L_Loading_Loaded = itemsLoaded;
            store.L_Loading_Total = itemsTotal;
        };
        this.loadingManager.onLoad = function () {
            store.showProgress = true;
            store.showLoading = false
        };
        //模型动画列表
        this.modelAnimation
        //模型动画对象
        this.animationMixer
        this.animationColock = new THREE.Clock()
        //动画帧
        this.animationFrame = null
        // 轴动画帧
        this.rotationAnimationFrame = null
        // 动画构造器
        this.animateClipAction = null
        // 动画循环方式枚举
        this.loopMap = {
            LoopOnce: THREE.LoopOnce,
            LoopRepeat: THREE.LoopRepeat,
            LoopPingPong: THREE.LoopPingPong
        }
        // 模型骨架
        this.skeletonHelper
        // 网格辅助线
        this.gridHelper
        // 坐标轴辅助线
        this.axesHelper
        // 环境光
        this.ambientLight
        //平行光
        this.directionalLight
        this.directionalLight2
        this.directionalLight3
        this.directionalLight4
        this.directionalLight5
        this.directionalLight6
        // 平行光辅助线
        this.directionalLightHelper
        this.directionalLightHelper2
        this.directionalLightHelper3
        this.directionalLightHelper4
        this.directionalLightHelper5
        this.directionalLightHelper6
        // 点光源
        this.pointLight
        //点光源辅助线
        this.pointLightHelper
        //聚光灯
        this.spotLight
        //聚光灯辅助线
        this.spotLightHelper
        //模型平面
        this.planeGeometry
        //模型材质列表
        // this.modelMaterialList

        // 效果合成器
        this.effectComposer
        this.outlinePass
        // 动画渲染器
        this.renderAnimation = null
        // 碰撞检测
        this.raycaster = new THREE.Raycaster()
        // 鼠标位置
        this.mouse = new THREE.Vector2()
        // 模型自带贴图
        this.modelTextureMap
        // 辉光效果合成器
        this.glowComposer
        // 辉光渲染器
        this.unrealBloomPass
        // 需要辉光的材质
        this.glowMaterialList
        this.materials = {}
        // 拖拽对象控制器
        this.dragControls
        // 是否开启辉光
        this.glowUnrealBloomPass = false
        // 窗口变化监听事件
        this.onWindowResizesListener
        // 鼠标点击事件
        this.onMouseClickListener
        // 模型上传进度条回调函数
        this.modelProgressCallback = (e) => e
        // 当前拖拽的几何模型
        this.dragGeometryModel = {}
        this.clock = new THREE.Clock();
    }

    init() {
        return new Promise(async (reslove, reject) => {
            this.initRender()     //初始化渲染器
            this.initCamera()     //初始化相机
            this.initScene()      //初始化场景
            this.initControls()   //初始化控制器，控制摄像头,控制器一定要在渲染器后
            // this.createHelper()   // 创建辅助线
            this.createLight()    // 创建灯光
            this.addEvenListMouseLisatener()
            // // 添加物体模型 TODO：初始化时需要默认一个
            var load;

            store.modelList = JSON.parse(localStorage.getItem('SceneModels'));
            if (!store.modelList) {
                store.modelList = []
            }

            let len = store.modelList.length
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    const item = store.modelList[i];
                    let fileType = item.ModelName.substring(item.ModelName.lastIndexOf('.') + 1);
                    store.modelApi_name = item.ModelName;

                    load = await this.setModel({
                        filePath: `/${item.ModelName}`,
                        fileType,
                        ModelName: item.ModelName,
                        position: item.setting.position,
                        scale: item.setting.scale,
                        rotation: item.setting.rotation,
                        MaterialList: item.MaterialList,
                        index: i
                    })
                }
            }
            // if (modelLL) {
            //     let fileType = modelLL.substring(modelLL.lastIndexOf('.') + 1);
            //     store.modelApi_name = modelLL;
            //     load = await this.setModel({ filePath: `/${modelLL}`, fileType, ModelName: modelLL })
            // }
            // const load = await this.setModel({ filePath: `/${modelLL}`, fileType: fileType, ModelName: 'transformers_3' })
            this.createEffectComposer()         // 创建效果合成器
            this.sceneAnimation()            //场景渲染

            reslove(load)
        })
    }
    // 创建场景
    initScene() {
        this.scene = new THREE.Scene()
        const texture = new THREE.TextureLoader().load('/Bg/modelBG3.png')
        var loader = new THREE.CubeTextureLoader().setPath('/Bg/');

        // 定义6张贴图的路径
        var textureUrls = [
            'posx.jpg', 'negx.jpg', // 右、左
            'posy.jpg', 'negy.jpg', // 上、下
            'posz.jpg', 'negz.jpg'  // 前、后
        ];

        // 加载贴图并创建CubeTexture
        var textureCube = loader.load(textureUrls);

        // 设置贴图参数，可根据需要进行调整
        // textureCube.format = THREE.RGBFormat;
        textureCube.mapping = THREE.CubeReflectionMapping;

        // 将贴图应用到场景的背景中
        // this.scene.background = textureCube;
        this.scene.environment = textureCube

        texture.mapping = THREE.EquirectangularReflectionMapping
        // this.scene.background = texture
        // this.scene.environment = texture
        this.axesHelper = new THREE.AxesHelper(30); // 参数指定坐标轴的长度
        this.scene.add(this.axesHelper)

        this.gridHelper = new THREE.GridHelper();
        let systemSetting = JSON.parse(localStorage.getItem('systemSetting'));
        if (systemSetting && systemSetting.GridHelperIsOpen) {
            // 设置相机位置
            this.onSetModelGridHelper({ gridHelper: systemSetting.GridHelperIsOpen })
        }
    }
    // 创建相机
    initCamera() {
        const { clientHeight, clientWidth } = this.container
        // this.camera = new THREE.PerspectiveCamera(50, clientWidth / clientHeight, 0.25, 2000)
        this.camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 10000)
        // this.camera.position.set(0, 300, 0)
    }
    // 创建渲染器
    initRender() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) //设置抗锯齿
        // this.renderer = new WebGPURenderer({ antialias: true, alpha: true }) //设置抗锯齿 //Material "RawShaderMaterial" is not compatible.
        this.renderer.setPixelRatio(window.devicePixelRatio) //渲染器像素比率设置为屏幕像素比
        //渲染的尺寸大小
        const { clientHeight, clientWidth } = this.container
        this.renderer.setSize(clientWidth, clientHeight)
        //色调映射
        this.renderer.toneMapping = THREE.CineonToneMapping; //设置色调映射算法为 电影胶片的色调
        this.renderer.autoClear = true
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        //曝光
        this.renderer.toneMappingExposure = .5
        // this.renderer.shadowMap.enabled = true //如果设置开启，允许在场景中使用阴影贴图。默认是 false。
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.container.appendChild(this.renderer.domElement)
    }

    // 创建控制器
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        this.controls.enableZoom = true; //摄像机缩放
        this.controls.enablePan = true; //摄像机平移
        this.controls.maxDistance = 100; //最小缩放值
        // this.controls.rotateSpeed = 1.5; //旋转的速度
        // this.controls.enableDamping = true;//启用阻尼（惯性）
        // this.controls.screenSpacePanning = true;
        // this.controls.minDistance = 10;
        // this.controls.maxDistance = 50000;
        // this.controls.enablePan = false
    }

    // 更新场景
    sceneAnimation() {
        this.renderer.render(this.scene, this.camera);
        this.renderAnimation = requestAnimationFrame(() => this.sceneAnimation())
        // 将不需要处理辉光的材质进行存储备份
        this.scene.traverse((v) => {
            if (v instanceof THREE.Scene) {
                this.materials.scene = v.background
                v.background = null
            }
            // if (!this.glowMaterialList.includes(v.name) && v.isMesh) {
            //     this.materials[v.uuid] = v.material
            //     v.material = new THREE.MeshStandardMaterial({ color: 'black' })
            // }
        })
        this.glowComposer.render()
        // 在辉光渲染器执行完之后在恢复材质原效果
        this.scene.traverse((v) => {
            if (this.materials[v.uuid]) {
                v.material = this.materials[v.uuid]
                delete this.materials[v.uuid]
            }
            if (v instanceof THREE.Scene) {
                v.background = this.materials.scene
                delete this.materials.scene
            }
        })

        if (this.animationMixer) {
            let delta = this.clock.getDelta();
            this.animationMixer.update(delta);
        }

        this.controls.update();
        TWEEN.update();
        this.effectComposer.render();
    }

    // 创建光源
    createLight() {
        // 创建环境光
        this.ambientLight = new THREE.AmbientLight('#fff', .8)
        this.scene.add(this.ambientLight)

        // 创建平行光
        this.directionalLight = new THREE.DirectionalLight('#fff', 1)
        this.directionalLight.position.set(30, 0, 0)
        // this.directionalLight.castShadow = true
        // this.directionalLight.visible = false
        this.scene.add(this.directionalLight)

        this.directionalLight2 = new THREE.DirectionalLight('#fff', 1)
        this.directionalLight2.position.set(-30, 0, 0)
        this.scene.add(this.directionalLight2)


        this.directionalLight3 = new THREE.DirectionalLight('#fff', 1)
        this.directionalLight3.position.set(0, 0, 30)
        this.scene.add(this.directionalLight3)
        this.directionalLight4 = new THREE.DirectionalLight('#fff', 1)
        this.directionalLight4.position.set(0, 0, -30)
        this.scene.add(this.directionalLight4)


        this.directionalLight5 = new THREE.DirectionalLight('#fff', 1)
        this.directionalLight5.position.set(0, 30, 0)
        this.scene.add(this.directionalLight5)
        this.directionalLight6 = new THREE.DirectionalLight('#fff', 1)
        this.directionalLight6.position.set(0, -30, 0)
        this.scene.add(this.directionalLight6)
        // 创建平行光辅助线
        this.directionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 2)
        this.directionalLightHelper.visible = false
        this.scene.add(this.directionalLightHelper)

        this.directionalLightHelper2 = new THREE.DirectionalLightHelper(this.directionalLight2, 2)
        this.directionalLightHelper2.visible = false
        this.scene.add(this.directionalLightHelper2)
        this.directionalLightHelper3 = new THREE.DirectionalLightHelper(this.directionalLight3, 2)
        this.directionalLightHelper3.visible = false
        this.scene.add(this.directionalLightHelper3)
        this.directionalLightHelper4 = new THREE.DirectionalLightHelper(this.directionalLight4, 2)
        this.directionalLightHelper4.visible = false
        this.scene.add(this.directionalLightHelper4)
        this.directionalLightHelper5 = new THREE.DirectionalLightHelper(this.directionalLight5, 2)
        this.directionalLightHelper5.visible = false
        this.scene.add(this.directionalLightHelper5)
        this.directionalLightHelper6 = new THREE.DirectionalLightHelper(this.directionalLight6, 2)
        this.directionalLightHelper6.visible = false
        this.scene.add(this.directionalLightHelper6)

        // 创建点光源
        this.pointLight = new THREE.PointLight(0xffffff, 12, 0, 0)
        this.pointLight.position.set(10, 55, 25)
        this.pointLight.visible = false
        this.scene.add(this.pointLight)
        // 创建点光源辅助线
        this.pointLightHelper = new THREE.PointLightHelper(this.pointLight, 1.5)
        this.pointLightHelper.visible = false
        this.scene.add(this.pointLightHelper)

        // //  创建聚光灯
        // this.spotLight = new THREE.SpotLight('#00BABD', 900);
        // this.spotLight.visible = false
        // this.spotLight.map = new THREE.TextureLoader().load(require('@/assets/image/model-bg-1.jpg'));
        // this.spotLight.decay = 2;
        // this.spotLight.shadow.mapSize.width = 1920;
        // this.spotLight.shadow.mapSize.height = 1080;
        // this.spotLight.shadow.camera.near = 1;
        // this.spotLight.shadow.camera.far = 10;
        // this.scene.add(this.spotLight);
        // //创建聚光灯辅助线
        // this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        // this.spotLightHelper.visible = false
        // this.scene.add(this.spotLightHelper)

        // 模型平面
        const geometry = new THREE.PlaneGeometry(40, 40);
        var groundMaterial = new THREE.MeshStandardMaterial({ color: '#000000' });
        this.planeGeometry = new THREE.Mesh(geometry, groundMaterial);
        this.planeGeometry.name = 'planeGeometry'
        this.planeGeometry.rotation.x = -Math.PI / 2
        this.planeGeometry.position.set(0, -.5, 0)

        // 让地面接收阴影
        this.planeGeometry.receiveShadow = true;
        this.planeGeometry.visible = false
        this.scene.add(this.planeGeometry);
    }

    // 创建效果合成器
    createEffectComposer() {
        const { clientHeight, clientWidth } = this.container
        this.effectComposer = new EffectComposer(this.renderer)
        const renderPass = new RenderPass(this.scene, this.camera)
        this.effectComposer.addPass(renderPass)
        this.outlinePass = new OutlinePass(new THREE.Vector2(clientWidth, clientHeight), this.scene, this.camera)
        this.outlinePass.visibleEdgeColor = new THREE.Color('#FF8C00') // 可见边缘的颜色
        this.outlinePass.hiddenEdgeColor = new THREE.Color('#ff90f3') // 不可见边缘的颜色
        // this.outlinePass.visibleEdgeColor = new THREE.Color('#ffffff') // 可见边缘的颜色
        // this.outlinePass.hiddenEdgeColor = new THREE.Color('#ffffff') // 不可见边缘的颜色
        this.outlinePass.edgeGlow = 2 // 发光强度
        this.outlinePass.usePatternTexture = false // 是否使用纹理图案
        this.outlinePass.edgeThickness = 1 // 边缘浓度
        this.outlinePass.edgeStrength = 2 // 边缘的强度，值越高边框范围越大
        // this.outlinePass.pulsePeriod = 600 // 闪烁频率，值越大频率越低
        this.effectComposer.addPass(this.outlinePass)
        let outputPass = new OutputPass()
        this.effectComposer.addPass(outputPass)

        let effectFXAA = new ShaderPass(FXAAShader)
        const pixelRatio = this.renderer.getPixelRatio()
        effectFXAA.uniforms.resolution.value.set(1 / (clientWidth * pixelRatio), 1 / (clientHeight * pixelRatio))
        effectFXAA.renderToScreen = true
        effectFXAA.needsSwap = true
        this.effectComposer.addPass(effectFXAA) //抗锯齿

        //创建辉光效果
        this.unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(clientWidth, clientHeight), 1.5, 0.4, 0.85)
        // 辉光合成器{ antialias: true, alpha: true }
        const renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        const glowRender = new THREE.WebGLRenderTarget(clientWidth * 2, clientHeight * 2, renderTargetParameters)
        this.glowComposer = new EffectComposer(this.renderer, glowRender)
        this.glowComposer.renderToScreen = false
        this.glowComposer.addPass(new RenderPass(this.scene, this.camera))
        this.glowComposer.addPass(this.unrealBloomPass)

        // // 着色器
        let shaderPass = new ShaderPass(new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: this.glowComposer.renderTarget2.texture },
                tDiffuse: {
                    value: null
                }
            },
            vertexShader,
            fragmentShader,
            defines: {}
        }), 'baseTexture')

        shaderPass.renderToScreen = true
        shaderPass.needsSwap = true
        this.effectComposer.addPass(shaderPass)

    }
    // 切换模型
    onSwitchModel(model) {
        return new Promise(async (reslove, reject) => {
            try {
                this.clearSceneModel()
                // 重置"灯光"模块数据
                // this.onResettingLight({ ambientLight: true })
                // this.camera.fov = 50
                // this.geometryGroup.clear()
                // 加载模型
                const load = await this.setModel(model)
                console.log(model, 'model');
                // 模型加载成功返回 true
                reslove({ load, filePath: model.filePath })

            } catch {
                reject()
            }
        })
    }
    // add model to scene.
    addModelToScene(model) {
        return new Promise(async (reslove, reject) => {
            try {
                const load = await this.setModel(model)

                reslove({ load, filePath: model.filePath })
            } catch {
                reject()
            }
        })
    }

    // 加载模型
    setModel({ filePath, fileType, scale, map, position, ModelName, fileSize, rotation, MaterialList, index }) {
        return new Promise((resolve, reject) => {
            const loader = this.fileLoaderMap[fileType]
            if (['glb', 'gltf'].includes(fileType)) {
                const dracoLoader = new DRACOLoader()
                dracoLoader.setDecoderPath('./threeFile/gltf/')
                loader.setDRACOLoader(dracoLoader)
            }

            loader.setPath('/upload/').load(filePath, (result) => {
                switch (fileType) {
                    case 'glb':
                        this.model = result.scene
                        this.skeletonHelper = new THREE.SkeletonHelper(result.scene)
                        this.modelAnimation = result.animations || []
                        break;
                    case 'fbx':
                        this.model = result
                        this.skeletonHelper = new THREE.SkeletonHelper(result)
                        this.modelAnimation = result.animations || []
                        break;
                    case 'gltf':
                        this.model = result.scene
                        this.skeletonHelper = new THREE.SkeletonHelper(result.scene)
                        this.modelAnimation = result.animations || []
                        break;
                    case 'obj':
                        this.model = result
                        this.skeletonHelper = new THREE.SkeletonHelper(result)
                        this.modelAnimation = result.animations || []
                        break;
                    default:
                        break;
                }
                this.model.ModelName = ModelName
                store.selectModel = this.model
                store.selectModel_Name = this.model.ModelName
                store.selectModel_Id = this.model.id


                this.getModelMeaterialList(MaterialList)
                this.setModelPositionSize()


                if (scale) {
                    let { x, y, z } = scale
                    this.model.scale.set(x, y, z);
                }
                this.model.position.set(0, 0, 0)
                if (position) {
                    let { x, y, z } = position
                    this.model.position.set(x, y, z)
                }
                if (rotation) {
                    let { x, y, z } = rotation
                    this.model.rotation.set(x, y, z)
                }

                this.animationMixer = new THREE.AnimationMixer(this.model)

                this.skeletonHelper.visible = false
                this.scene.add(this.skeletonHelper)
                // 需要辉光的材质
                this.glowMaterialList = store.modelMaterialList.map(v => v.name)

                // 存储模型信息

                if (index || index == 0) {
                    store.modelList[index].id = this.model.id
                } else {
                    store.modelList.push({
                        name: this.model.name,
                        id: this.model.id,
                        ModelName: this.model.ModelName,
                        MaterialList: this.model.userData.MaterialList,// 这个模型的全部材质userData
                        setting: {
                            visible: this.model.visible,
                            position: { x: this.model.position.x, y: this.model.position.y, z: this.model.position.z },
                            scale: { x: this.model.scale.x, y: this.model.scale.y, z: this.model.scale.z },
                            position: { x: this.model.position.x, y: this.model.position.y, z: this.model.position.z },
                            rotation: { x: this.model.rotation.x, y: this.model.rotation.y, z: this.model.rotation.z },
                        },// 这个模型的缩放等
                    })
                }

                this.scene.add(this.model)

                resolve(true)
            }, (xhr) => {
                // this.modelProgressCallback(xhr.loaded)
            }, (err) => {
                console.log(err)
                reject()
            })
        })
    }
    // 设置模型定位缩放大小
    setModelPositionSize() {
        //设置模型位置
        this.model.updateMatrixWorld()
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());

        const center = box.getCenter(new THREE.Vector3());

        // 计算缩放比例
        var maxSize = Math.max(size.x, size.y, size.z);
        const targetSize = 2.5; // 目标大小

        var scale = targetSize / (maxSize > 1 ? maxSize : .5);

        // if (scale < 0.1) {
        //     scale = 0.1
        // }
        // this.model.scale.set(scale, scale, scale)
        // 设置模型位置

        this.model.position.sub(center.multiplyScalar(scale))

        // 设置相机位置
        this.camera.position.set(300, 0, 0)
        // 设置相机坐标系
        this.camera.lookAt(center)
        this.camera.updateProjectionMatrix();

        let systemSetting = JSON.parse(localStorage.getItem('systemSetting'));
        if (systemSetting && systemSetting.cameraPosition) {
            // 设置相机位置
            this.camera.position.set(systemSetting.cameraPosition.x, systemSetting.cameraPosition.y, systemSetting.cameraPosition.z)
        }

    }
    // 获取模型自带贴图
    getModelMaps(materials, uuid) {
        let textureMap = {}
        materials.forEach(texture => {
            if (texture.map && texture.map.image) {
                const canvas = document.createElement('canvas')
                const { width, height } = texture.map.image
                canvas.width = width
                canvas.height = height
                const context = canvas.getContext('2d')
                context.drawImage(texture.map.image, 0, 0)
                textureMap = {
                    url: canvas.toDataURL('image/png'),
                    mapId: texture.uuid
                }
            }
        })
        return textureMap
    }
    // 获取当前模型材质
    getModelMeaterialList(MaterialList) {

        store.modelMaterialList = [];
        store.modelMeshList = [];
        this.model.userData.MaterialList = [];//存起来这个模型的所有材质的userdata

        // 判断是否有当前模型缓存
        // var LLlocalModel = JSON.parse(localStorage.getItem(store.modelApi_name));

        if (MaterialList && MaterialList.length > 0) {
            // 用户web界面新增的材质缓存
            // var LLlocalModel_newMaterial = JSON.parse(localStorage.getItem(store.modelApi_name + 'NewMaterial'));
            // store.newMaterial = LLlocalModel_newMaterial
            // console.log(MaterialList, 'MaterialList');

            store.selectModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    // // 判断是否存在于用户新增材质的缓存里
                    // for (let i = 0; i < LLlocalModel_newMaterial.length; i++) {
                    //     const element = LLlocalModel_newMaterial[i];
                    //     if (element.user.indexOf(child.name) != -1) { //是则修改材质名为缓存名
                    //         child.material = child.material.clone()
                    //         child.material.name = element.MaterialName;
                    //     }
                    // }

                    if (store.modelMaterialList.some(obj => obj.name === child.material.name)) {
                        child.material = store.modelMaterialList.filter(obj => obj.name === child.material.name)[0]
                        child.material.needsUpdate = true;
                    } else {
                        child.material.depthWrite = true; //材质深写入
                        child.material.transparent = true;//打开透明

                        let userData = MaterialList.find(obj => obj.name === child.material.name)
                        // save模型最初的材质 userData.initialMaterial

                        userData.initialMaterial = child.material.clone();

                        // console.log(userData, '此材质缓存的userData')
                        this.model.userData.MaterialList.push(userData)
                        switch (userData.type) {
                            case "MeshMatcapMaterial":
                                child.material = new THREE.MeshMatcapMaterial({
                                    name: userData.name,
                                    opacity: userData.opacity ? userData.opacity : userData.initialMaterial.opacity,
                                    side: userData.side ? userData.side : userData.initialMaterial.side,
                                    color: userData.color ? new THREE.Color(userData.color) : userData.initialMaterial.color,
                                    map: userData.map ? new THREE.TextureLoader().load(userData.map) : userData.initialMaterial.map,
                                    userData,
                                })

                                child.material.transparent = true;
                                store.modelMaterialList.push(child.material);
                                break;
                            case "MeshPhysicalMaterial":
                                // console.log(userData);
                                child.material = new THREE.MeshPhysicalMaterial({
                                    name: userData.name,
                                    opacity: userData.opacity ? userData.opacity : userData.initialMaterial.opacity,
                                    side: userData.side ? userData.side : userData.initialMaterial.side,
                                    color: userData.color ? new THREE.Color(userData.color) : userData.initialMaterial.color,
                                    map: userData.map ? new THREE.TextureLoader().load(userData.map) : userData.initialMaterial.map,
                                    aoMap: userData.aoMap ? new THREE.TextureLoader().load(userData.aoMap) : userData.initialMaterial.aoMap,
                                    roughness: userData.roughness || userData.roughness == 0 ? userData.roughness : userData.initialMaterial.roughness,
                                    metalness: userData.metalness ? userData.metalness : userData.initialMaterial.metalness,
                                    ior: userData.ior ? userData.ior : (userData.initialMaterial.ior ? userData.initialMaterial.ior : 1.5),
                                    sheen: userData.sheen ? userData.sheen : (userData.initialMaterial.sheen ? userData.initialMaterial.sheen : 0),
                                    reflectivity: userData.reflectivity || userData.reflectivity == 0 ? userData.reflectivity : (userData.initialMaterial.reflectivity ? userData.initialMaterial.reflectivity : 0.5),
                                    userData,

                                    normalMap: userData.normalMap ? new THREE.TextureLoader().load(userData.normalMap) : userData.initialMaterial.normalMap,
                                    metalnessMap: userData.metalnessMap ? new THREE.TextureLoader().load(userData.metalnessMap) : userData.initialMaterial.metalnessMap,
                                    roughnessMap: userData.roughnessMap ? new THREE.TextureLoader().load(userData.roughnessMap) : userData.initialMaterial.roughnessMap,
                                })

                                child.material.transparent = true;
                                store.modelMaterialList.push(child.material);
                                break;

                            case "MeshPhongMaterial":
                                child.material = new THREE.MeshPhongMaterial({
                                    name: userData.name,
                                    opacity: userData.opacity ? userData.opacity : userData.initialMaterial.opacity,
                                    side: userData.side ? userData.side : userData.initialMaterial.side,
                                    color: userData.color ? new THREE.Color(userData.color) : userData.initialMaterial.color,
                                    map: userData.map ? new THREE.TextureLoader().load(userData.map) : userData.initialMaterial.map,
                                    aoMap: userData.aoMap ? new THREE.TextureLoader().load(userData.aoMap) : userData.initialMaterial.aoMap,

                                    reflectivity: userData.reflectivity || userData.reflectivity == 0 ? userData.reflectivity : userData.initialMaterial.reflectivity,
                                    userData,
                                })

                                child.material.transparent = true;
                                store.modelMaterialList.push(child.material);
                                break;
                            case "MeshStandardMaterial":
                                // console.log(child.material);
                                child.material = new THREE.MeshStandardMaterial({
                                    name: userData.name,
                                    opacity: userData.opacity ? userData.opacity : userData.initialMaterial.opacity,
                                    side: userData.side ? userData.side : userData.initialMaterial.side,
                                    color: userData.color ? new THREE.Color(userData.color) : userData.initialMaterial.color,
                                    map: userData.map ? new THREE.TextureLoader().load(userData.map) : userData.initialMaterial.map,
                                    aoMap: userData.aoMap ? new THREE.TextureLoader().load(userData.aoMap) : userData.initialMaterial.aoMap,
                                    metalness: userData.metalness || userData.initialMaterial.metalness || 0,
                                    roughness: userData.roughness || userData.initialMaterial.roughness || 1,
                                    transparent: true,
                                    userData,
                                    // alphaHash: false,
                                    // alphaMap: null,
                                    // alphaToCoverage: false,
                                    // aoMap: null,
                                    // aoMapIntensity: 1,
                                    // blendDst: 205,
                                    // blendDstAlpha: null,
                                    // blendEquation: 100,
                                    // blendEquationAlpha: null,
                                    // blendSrc: 204,
                                    // blendSrcAlpha: null,
                                    // blending: 1,
                                    // bumpMap: null,
                                    // bumpScale: 1,
                                    // clipIntersection: false,
                                    // clipShadows: false,
                                    // clippingPlanes: null,
                                    // emissive: new THREE.Color(0x000000),
                                    // emissiveIntensity: 1,
                                    // envMapIntensity: 1,
                                    // flatShading: false,


                                    normalMap: userData.normalMap ? new THREE.TextureLoader().load(userData.normalMap) : userData.initialMaterial.normalMap,
                                    metalnessMap: userData.metalnessMap ? new THREE.TextureLoader().load(userData.metalnessMap) : userData.initialMaterial.metalnessMap || null,
                                    roughnessMap: userData.roughnessMap ? new THREE.TextureLoader().load(userData.roughnessMap) : userData.initialMaterial.roughnessMap || null,
                                })

                                store.modelMaterialList.push(child.material);
                                break;
                            default:
                                child.material.userData = userData;
                                store.modelMaterialList.push(child.material);
                                break;
                        }
                    }
                    store.modelMeshList.push(child)

                }
            })
        }
        else {
            this.model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (store.modelMaterialList.some(obj => obj.name === child.material.name)) {
                        child.material = store.modelMaterialList.filter(obj => obj.name === child.material.name)[0]
                        child.material.needsUpdate = true;
                    } else {
                        child.material.depthWrite = true
                        child.material.transparent = true;//打开透明
                        // child.material = new THREE.MeshMatcapMaterial({
                        //     color: child.material.color,
                        //     name: child.material.name,
                        //     map: child.material.map || null
                        // })
                        // child.material.transparent = true;
                        // child.material.userData.type = 'MeshMatcapMaterial';


                        // save模型最初的材质 userData.initialMaterial


                        // 根据材质类型push不同的配置项
                        let type = child.material.type;
                        switch (type) {
                            case 'MeshMatcapMaterial':
                                child.material.userData = {
                                    metalness: child.material.metalness,
                                }
                                break;
                            case 'MeshPhysicalMaterial': //MeshPhysicalMaterial   物理网格模型
                                child.material.userData = {
                                    metalness: child.material.metalness,
                                    roughness: child.material.roughness,
                                    ior: child.material.ior,
                                    reflectivity: child.material.reflectivity,
                                    sheen: child.material.sheen,
                                    sheenRoughness: child.material.sheenRoughness,
                                    emissiveIntensity: child.material.emissiveIntensity,
                                }
                                break;
                            case 'MeshStandardMaterial': //MeshStandardMaterial   标准网格模型
                                child.material.userData = {
                                    metalness: child.material.metalness,
                                    roughness: child.material.roughness,
                                    emissiveIntensity: child.material.emissiveIntensity,
                                }
                                break;
                            case 'MeshPhongMaterial': //MeshPhongMaterial   Phong网格材质
                                child.material.userData = {
                                    emissiveIntensity: child.material.emissiveIntensity,
                                }
                                break;
                            default:
                                child.material.userData = {
                                    type: item.type,
                                    name: item.name,
                                    side: item.side,
                                    opacity: item.opacity,
                                }
                                break;
                        }
                        child.material.userData.initialMaterial = child.material.clone();
                        child.material.userData.name = child.material.name;
                        child.material.userData.type = child.material.type;
                        child.material.userData.side = child.material.side;
                        child.material.userData.color = '#' + child.material.color.getHex().toString(16);
                        child.material.userData.opacity = child.material.opacity;


                        store.modelMaterialList.push(child.material);
                        store.selectModel.userData.MaterialList.push(child.material.userData)
                    }

                    store.modelMeshList.push(child)

                }
            })

            // store.modelMaterialList.forEach(item => {
            //     item.userData = {
            //         type: item.type,
            //         name: item.name,
            //         side: item.side || 0,
            //         opacity: item.opacity,
            //         metalness: item.metalness || 0,
            //         roughness: item.roughness || 1,
            //         ior: item.ior || 1.5,
            //         reflectivity: item.reflectivity || 0,
            //     }
            //     // let type = item.type;
            //     // switch (type) {
            //     //     case 'MeshMatcapMaterial':
            //     //         item.userData = {
            //     //             type: item.type,
            //     //             name: item.name,
            //     //             side: item.side,
            //     //             opacity: item.opacity,
            //     //             metalness: item.metalness || 1,
            //     //         }
            //     //         break;
            //     //     case 'MeshPhysicalMaterial': //MeshPhysicalMaterial   物理网格模型
            //     //         item.userData = {
            //     //             type: item.type,
            //     //             name: item.name,
            //     //             side: item.side,
            //     //             opacity: item.opacity,
            //     //             metalness: item.metalness
            //     //         }
            //     //         break;
            //     //     default:
            //     //         item.userData = {
            //     //             type: item.type,
            //     //             name: item.name,
            //     //             side: item.side,
            //     //             opacity: item.opacity,
            //     //         }
            //     //         break;
            //     // }
            // });


        }
    }

    // 监听事件
    addEvenListMouseLisatener() {
        //监听场景大小改变，跳转渲染尺寸
        this.onWindowResizesListener = this.onWindowResizes.bind(this)
        window.addEventListener("resize", this.onWindowResizesListener)
        // // 鼠标点击
        this.onMouseClickListener = this.onMouseClickModel.bind(this)
        this.container.addEventListener('dblclick', this.onMouseClickListener)
    }
    // 模型点击事件
    onMouseClickModel(event) {
        const { clientHeight, clientWidth, offsetLeft, offsetTop } = this.container
        this.mouse.x = ((event.clientX - offsetLeft) / clientWidth) * 2 - 1
        this.mouse.y = -((event.clientY - offsetTop) / clientHeight) * 2 + 1
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const intersects = this.raycaster.intersectObjects(this.scene.children).filter(item => item.object.isMesh)
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object
            console.log(intersectedObject);

            this.outlinePass.selectedObjects = [intersectedObject]

            store.selectMesh_materialName = intersectedObject.material.name
            store.selectMesh = intersectedObject
        } else {
            this.outlinePass.selectedObjects = []
            store.selectMesh = {}
        }
    }
    // 监听窗口变化
    onWindowResizes() {
        if (!this.container) return false
        const { clientHeight, clientWidth } = this.container
        //调整屏幕大小
        this.camera.aspect = clientWidth / clientHeight //摄像机宽高比例
        this.camera.updateProjectionMatrix() //相机更新矩阵，将3d内容投射到2d面上转换
        this.renderer.setSize(clientWidth, clientHeight)
        this.effectComposer.setSize(clientWidth * 2, clientHeight * 2)
        // this.glowComposer.setSize(clientWidth, clientHeight)
    }
    clearSceneModel() {
        //先移除模型 材质释放内存
        this.scene.traverse((v) => {
            if (v.type === 'Mesh') {
                v.geometry.dispose();
                v.material.dispose();
            }
        })
        this.dragGeometryModel = {}
        //取消动画帧
        // cancelAnimationFrame(this.animationFrame)
        // cancelAnimationFrame(this.rotationAnimationFrame)
        this.scene.remove(this.model)
        this.model = null
        this.modelTextureMap = []
        this.glowMaterialList = []
        store.modelMaterialList = []
        this.materials = {}
        if (this.dragControls) {
            this.dragControls.dispose()
        }
        this.renderer.toneMappingExposure = 1
        // Object.assign(this.unrealBloomPass, {
        //     threshold: 0,
        //     strength: 0,
        //     radius: 0,
        // })

        // // 重置"辅助线/轴配置"模块数据
        // this.skeletonHelper.visible = false
        const config = {
            gridHelper: false,
            x: 0,
            y: -0.59,
            z: -0.1,
            positionX: 0,
            positionY: -0.5,
            positionZ: 0,
            divisions: 10,
            size: 4,
            color: "rgb(193,193,193)",
            axesHelper: false,
            axesSize: 3,
        }
        // this.onResettingLight({ ambientLight: false })
        // this.onSetModelGridHelper(config)
        // this.onSetModelGridHelperSize(config)

        this.onSetModelAxesHelper(config)

    }




    /**
     * @describe 背景模块方法
     * @function onSetSceneColor 设置场景颜色
     * @function onSetSceneImage 设置场景图片
     * @function onSetSceneViewImage 设置全景图
     */
    // 设置场景颜色
    onSetSceneColor(color) {
        this.scene.background = new THREE.Color(color)
    }
    // 设置场景图片
    onSetSceneImage(url) {
        this.scene.background = new THREE.TextureLoader().load(url);
    }
    // 设置全景图
    onSetSceneViewImage(url) {
        const texture = new THREE.TextureLoader().load(url);
        texture.mapping = THREE.EquirectangularReflectionMapping
        this.scene.background = texture
        this.scene.environment = texture
    }
    // 设置色调映射
    change_renderer_toneMapping(val) {
        this.renderer.toneMapping = val;
    }




    playAni(aniName, active) {

        let explosionClip = THREE.AnimationClip.findByName(this.modelAnimation, aniName); //获取动画剪辑
        this.animateClipAction = this.animationMixer.clipAction(explosionClip); // 创建动画动作
        if (active == 'play') {
            this.animateClipAction.reset().play();
        } else if (active == 'pause') {
            this.animateClipAction.paused = true; // 暂停动画
        } else if (active == 'stop') {
            this.animateClipAction.reset();
            this.animateClipAction.paused = true; // 暂停动画
        }
    }





    /**
     * @describe 材质模块方法
     * @function getModelMeaterialList 获取当前模型材质
     * @function setModelPositionSize 设置模型定位缩放大小
     * @function getModelMaps 获取模型自带贴图
     * @function onSetModelMaterial 设置材质属性（网格,透明度，颜色，深度写入）
     * @function onSetModelMap 设置模型贴图（模型自带）
     * @function onSetSystemModelMap 设置模型贴图（系统贴图）
     * @function onChangeModelMeaterial 选择材质
     * @function onGetEditMeshList 获取最新材质信息列表
     * @function onChangeModelMeshType 切换材质类型
     * @function onSetGeometryMeshList 设置几何体模型材质
     */



    // 选择材质
    onChangeModelMeaterial(material) {
        store.selectMaterial = material
        // store.selectModel.traverse(v => {
        //     if (v.isMesh && v.material.name == material.name) {
        //         v.material = store.selectMaterial
        //         v.material.needsUpdate = true;
        //     }
        // })
        return material
    }
    // 选择mesh网格
    onChangeModelMesh(mesh) {
        this.outlinePass.selectedObjects = [mesh]
        store.selectMesh = mesh
        return mesh
    }
    // 设置这个mesh所使用的材质
    change_material_use(meshName, value) {
        var mesh = this.scene.getObjectByName(meshName);
        store.newMaterial.forEach(i => {
            if (i.user.includes(meshName) && i.MaterialName !== mesh.material.name) {
                let index = i.user.indexOf(meshName);
                store.newMaterial.splice(index, 1);
            }
        });
        let index = store.modelMaterialList.findIndex(i => i.name == value)
        mesh.material = store.modelMaterialList[index]
    }


    // 设置材质类型
    onChangeModelMeshType(type) {
        const { name, userData } = store.selectMaterial;
        // store.selectMaterial = new THREE[type]({
        //     name,
        //     map,
        //     transparent: true,
        //     color,
        //     opacity,
        //     userData: userData
        // })

        // store.modelMaterialList.forEach(item => {
        //     if (item.name == name) {
        //         item.userData = userData
        //         item.needsUpdate = true;
        //     }
        // });
        // console.log(store.selectMaterial);
        console.log(userData, 'userData');

        // console.log(userData.map, 'userData.map');
        // console.log(userData.initialMaterial.map, 'userData.initialMaterial.map');
        console.log(userData.type, 'userData.type');
        switch (userData.type) {
            case 'MeshMatcapMaterial':
                store.selectMaterial = new THREE.MeshMatcapMaterial({
                    name: userData.name,
                    opacity: userData.opacity ? userData.opacity : userData.initialMaterial.opacity,
                    side: userData.side ? userData.side : userData.initialMaterial.side,
                    color: userData.color ? new THREE.Color(userData.color) : userData.initialMaterial.color,
                    map: userData.map ? new THREE.TextureLoader().load(userData.map) : userData.initialMaterial.map,
                    userData,
                    transparent: true
                })
                break;
            case "MeshPhysicalMaterial":
                store.selectMaterial = new THREE.MeshPhysicalMaterial({
                    name: userData.name,
                    opacity: userData.opacity ? userData.opacity : userData.initialMaterial.opacity,
                    side: userData.side ? userData.side : userData.initialMaterial.side,
                    color: userData.color ? new THREE.Color(userData.color) : userData.initialMaterial.color,
                    map: userData.map ? new THREE.TextureLoader().load(userData.map) : userData.initialMaterial.map,
                    aoMap: userData.aoMap ? new THREE.TextureLoader().load(userData.aoMap) : userData.initialMaterial.aoMap,
                    roughness: userData.roughness || userData.roughness == 0 ? userData.roughness : userData.initialMaterial.roughness,
                    metalness: userData.metalness ? userData.metalness : userData.initialMaterial.metalness,
                    ior: userData.ior ? userData.ior : (userData.initialMaterial.ior ? userData.initialMaterial.ior : 1.5),
                    reflectivity: userData.reflectivity || userData.reflectivity == 0 ? userData.reflectivity : userData.initialMaterial.reflectivity,


                    userData,
                    transparent: true,
                    normalMap: userData.normalMap ? new THREE.TextureLoader().load(userData.normalMap) : userData.initialMaterial.normalMap,
                    metalnessMap: userData.metalnessMap ? new THREE.TextureLoader().load(userData.metalnessMap) : userData.initialMaterial.metalnessMap,
                    roughnessMap: userData.roughnessMap ? new THREE.TextureLoader().load(userData.roughnessMap) : userData.initialMaterial.roughnessMap,
                })
                break;
            case "MeshPhongMaterial":
                store.selectMaterial = new THREE.MeshPhongMaterial({
                    name: userData.name,
                    opacity: userData.opacity ? userData.opacity : userData.initialMaterial.opacity,
                    side: userData.side ? userData.side : userData.initialMaterial.side,
                    color: userData.color ? new THREE.Color(userData.color) : userData.initialMaterial.color,
                    map: userData.map ? new THREE.TextureLoader().load(userData.map) : userData.initialMaterial.map,
                    aoMap: userData.aoMap ? new THREE.TextureLoader().load(userData.aoMap) : userData.initialMaterial.aoMap,
                    reflectivity: userData.reflectivity || userData.initialMaterial.reflectivity || 1,
                    userData,
                    transparent: true,
                    normalMap: userData.normalMap ? new THREE.TextureLoader().load(userData.normalMap) : userData.initialMaterial.normalMap,
                })
                break;
            case "MeshStandardMaterial":
                store.selectMaterial = new THREE.MeshStandardMaterial({
                    name: userData.name,
                    opacity: userData.opacity ? userData.opacity : userData.initialMaterial.opacity,
                    side: userData.side ? userData.side : userData.initialMaterial.side,
                    color: userData.color ? new THREE.Color(userData.color) : userData.initialMaterial.color,
                    map: userData.map ? new THREE.TextureLoader().load(userData.map) : userData.initialMaterial.map,
                    aoMap: userData.aoMap ? new THREE.TextureLoader().load(userData.aoMap) : userData.initialMaterial.aoMap,
                    roughness: userData.roughness || userData.roughness == 0 ? userData.roughness : userData.initialMaterial.roughness,
                    metalness: userData.metalness ? userData.metalness : userData.initialMaterial.metalness,
                    emissive: userData.emissive ? new THREE.Color(userData.emissive) : userData.initialMaterial.emissive,
                    userData,

                    transparent: true,
                    normalMap: userData.normalMap ? new THREE.TextureLoader().load(userData.normalMap) : userData.initialMaterial.normalMap,
                    metalnessMap: userData.metalnessMap ? new THREE.TextureLoader().load(userData.metalnessMap) : userData.initialMaterial.metalnessMap,
                    roughnessMap: userData.roughnessMap ? new THREE.TextureLoader().load(userData.roughnessMap) : userData.initialMaterial.roughnessMap,
                    lightMap: userData.lightMap ? new THREE.TextureLoader().load(userData.lightMap) : userData.initialMaterial.lightMap,
                })
                break;
            default:
                break;
        }

        console.log(store.selectMaterial.userData);
        let index = store.modelMaterialList.findIndex(i => i.name == name)
        // store.modelMaterialList[index] == store.selectMaterial
        store.modelMaterialList.splice(index, 1, store.selectMaterial)

        store.selectModel.traverse(v => {
            if (v.isMesh && v.material.name == name) {
                v.material = store.modelMaterialList[index]
                v.material.needsUpdate = true;
            }
        })

        // // 根据材质类型push不同的配置项
        // store.modelMaterialList.forEach(item => {
        //     let type = item.type;
        //     switch (type) {
        //         case 'MeshMatcapMaterial':
        //             item.userData = {
        //                 type: item.type,
        //                 name: item.name,
        //                 side: item.side,
        //                 opacity: item.opacity,
        //             }
        //             break;
        //         case 'MeshPhysicalMaterial': //MeshPhysicalMaterial   物理网格模型
        //             item.userData = {
        //                 type: item.type,
        //                 name: item.name,
        //                 side: item.side,
        //                 opacity: item.opacity,
        //                 metalness: item.metalness
        //             }
        //             break;
        //         default:
        //             item.userData = {
        //                 type: item.type,
        //                 name: item.name,
        //                 side: item.side,
        //                 opacity: item.opacity,
        //             }
        //             break;
        //     }
        // });



        // store.selectMaterial.needsUpdate = true;
        // const { name, color, map, wireframe, depthWrite, opacity } = store.selectMesh.material
        // store.selectMesh.material = new THREE[activeMesh.value]({
        //     map,
        //     transparent: true,
        //     color,
        //     name,
        // })
        // depthWrite ? store.selectMesh.material.depthWrite = depthWrite : ''
        // opacity ? store.selectMesh.material.opacity = opacity : ''
        // wireframe ? store.selectMesh.material.wireframe = wireframe : ''
        // this.model.traverse(v => {
        //     if (v.isMesh && v.material) {
        //         const { name, color, map, wireframe, depthWrite, opacity } = v.material
        //         v.material = new THREE[activeMesh.value]({
        //             map,
        //             transparent: true,
        //             color,
        //             name,
        //         })
        //         depthWrite ? v.material.depthWrite = depthWrite : ''
        //         opacity ? v.material.opacity = opacity : ''
        //         wireframe ? v.material.wireframe = wireframe : ''
        //     }
        // })
    }

    // 设置材质属性
    onSetMaterial_Physical(config) {
        const { color, side, opacity, metalness, roughness, ior, reflectivity, sheen, sheenRoughness, emissive, emissiveIntensity } = config
        const selectMaterial = store.selectMaterial;

        if (!selectMaterial) return

        if (color) { selectMaterial.color = new THREE.Color(color); selectMaterial.userData.color = color };
        if (side) { selectMaterial.side = side; selectMaterial.userData.side = side };
        if (opacity) { selectMaterial.opacity = opacity; selectMaterial.userData.opacity = opacity };
        if (metalness) { selectMaterial.metalness = metalness; selectMaterial.userData.metalness = metalness };
        if (roughness) { selectMaterial.roughness = roughness; selectMaterial.userData.roughness = roughness };
        if (ior) { selectMaterial.ior = ior; selectMaterial.userData.ior = ior };
        if (reflectivity) { selectMaterial.reflectivity = reflectivity; selectMaterial.userData.reflectivity = reflectivity };
        if (sheen) { selectMaterial.sheen = sheen; selectMaterial.userData.sheen = sheen };
        if (sheenRoughness) { selectMaterial.sheenRoughness = sheenRoughness; selectMaterial.userData.sheenRoughness = sheenRoughness };

        // Phong网格材质↓
        if (emissive) { selectMaterial.emissive = new THREE.Color(emissive); selectMaterial.userData.emissive = emissive };
        if (emissiveIntensity) { selectMaterial.emissiveIntensity = emissiveIntensity; selectMaterial.userData.emissiveIntensity = emissiveIntensity };

    }


    onSetMaterialMap(map) {
        const selectMaterial = store.selectMaterial;
        if (selectMaterial) {
            selectMaterial.map = new THREE.TextureLoader().load(map);
            selectMaterial.userData.map = map
            selectMaterial.needsUpdate = true;
        }
    }
    /**
         * @describe 灯光模块方法
         * @function onSetModelAmbientLight 设置环境光
         * @function onSetModelDirectionalLight 设置平行光
         * @function onSetModelPointLight 设置点光源
         * @function onSetModelSpotLight 设置聚光灯
         * @function onSetModelPlaneGeometry 设置模型平面
         * @function onResettingLight 重置场景灯光
         */
    // 设置环境光
    onSetModelAmbientLight({ ambientLight, ambientLightColor, ambientLightIntensity }) {
        this.ambientLight.visible = ambientLight
        this.ambientLight.intensity = ambientLightIntensity
        this.ambientLight.color.set(ambientLightColor)
    }
    // 设置平行光
    onSetModelDirectionalLight(config) {
        const {
            directionaShadow,
            directionalHorizontal,
            directionalVertical,
            directionalSistance,
            directionalLight,
            directionalLightColor,
            directionalLightIntensity,
            directionalLightHelper
        } = config

        console.log(config);
        this.directionalLight.visible = directionalLight
        this.directionalLightHelper.visible = directionalLightHelper && directionalLight
        this.directionalLight.intensity = directionalLightIntensity
        this.directionalLight.castShadow = directionaShadow
        this.directionalLight.color.set(directionalLightColor)
        const { x, y, z } = lightPosition(directionalHorizontal, directionalVertical, directionalSistance)
        this.directionalLight.position.set(x, y, z)
        this.directionalLightHelper.update()
    }

    // 缓存用户新增的材质和所有使用新材质的meshName，下次进入加载
    saveUserNewMaterial() {
        let temp = []
        for (let i = 0; i < store.newMaterial.length; i++) {

            store.newMaterial[i].user = []
            store.selectModel.traverse(v => {
                if (v.isMesh && v.material.name == store.newMaterial[i].MaterialName) {
                    store.newMaterial[i].user.push(v.name)
                }
            })

            if (store.newMaterial[i].user.length > 0) {
                temp.push(store.newMaterial[i]);
            }
        }
        return temp
    };


    // 导出为glb
    export_glb() {
        const exporter = new GLTFExporter();
        const options = {
            trs: true,      // 是否保留位置、旋转、缩放信息
            // animations: this.modelAnimation, // 导出的动画
            // binary: type == 'glb' ? true : false,  // 是否以二进制格式输出//binary==true 导出glb | binary==false 导出gltf
            binary: true,
            embedImages: true,//是否嵌入贴图
            onlyVisible: true, //是否只导出可见物体
            // forcePowerOfTwoTextures: true,
            // includeCustomMaterials: true, //指定是否包含自定义材质
            // includeCustomAttributes: true, //	指定是否包含自定义属性
            // includeCustomTextures: true, //	指定是否包含自定义纹理
            // includeCustomSamplers: true, //	指定是否包含自定义采样器
            // includeCustomImages: true, //	指定是否包含自定义图像
            // includeCustomTechniques: true, //	指定是否包含自定义技术
            // includeCustomMaterialsCommon: true, //指定是否包含自定义 MaterialsCommon
            // includeCustomMeshes: true,//指定是否包含自定义网格
            // includeCustomSkins: true, //指定是否包含自定义皮肤
            // includeCustomNodes: true, // 指定是否包含自定义节点
            // includeCustomGeometries: true, //指定是否包含自定义几何体
            // includeCustomPrograms: true, // 指定是否包含自定义程序
            // includeCustomShaders: true, //指定是否包含自定义着色器
            // includeCustomExtensions: true, //指定是否包含自定义扩展。如果设置为true，则会包含在导出中定义的自定义GLTF扩展
        }

        exporter.parse(this.scene, function (gltf) {
            // exporter.parse(this.model, function (gltf) {
            console.log(gltf)
            if (gltf instanceof ArrayBuffer) {
                // 将结果保存为GLB二进制文件
                saveArrayBuffer(gltf, `${new Date().toLocaleString()}.glb`);
            } else {
                // 将结果保存为GLTF JSON文件
                saveString(JSON.stringify(gltf), `${new Date().toLocaleString()}.gltf`);
            }
            function saveArrayBuffer(buffer, filename) {
                // 将二进制数据保存为文件
                const blob = new Blob([buffer], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
                // message.success('导出成功')
                console.log('导出成功');
            }
            function saveString(text, filename) {
                // 将字符串数据保存为文件
                const blob = new Blob([text], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
                // message.success('导出成功')
                console.log('导出成功');
            }
        }, (err) => {
            console.error('导出err');
        }, options);
    }

    // 辅助线配置start========================================================


    // 设置坐标轴辅助线
    onSetModelAxesHelper({ axesHelper, axesSize }) {
        // 需要先把辅助线移除然后在重新创建
        this.scene.remove(this.axesHelper);
        this.axesHelper.geometry.dispose();
        this.axesHelper.material.dispose();
        this.axesHelper = new THREE.AxesHelper(axesSize);

        this.axesHelper.visible = axesHelper;
        this.scene.add(this.axesHelper);
    }



    onSetModelGridHelper({ gridHelper, gridSize = 60, gridDivisions = 20, colorCenterLine = '#18A058' }) {
        this.scene.remove(this.gridHelper);
        this.gridHelper.geometry.dispose();
        this.gridHelper.material.dispose();
        this.gridHelper = new THREE.GridHelper(gridSize, gridDivisions, '#444444', colorCenterLine);

        this.gridHelper.visible = gridHelper;
        this.scene.add(this.gridHelper);
    }


    // 辅助线配置end==========================================================

    // =======================================
    // =========== 设置场景整体模型 ===========
    // =======================================
    getObjectByName(modelName) { return this.scene.getObjectByName(modelName); }
    getObjectById(modelId) { return this.scene.getObjectById(modelId); }

    onSetModelDrag(isDrag) {
        if (isDrag) {
            this.dragControls = new DragControls([store.selectModel], this.camera, this.renderer.domElement);
            this.dragControls.transformGroup = true
            // 监听拖拽事件
            this.dragControls.addEventListener('dragstart', () => {
                this.controls.enabled = false
                // 拖拽开始事件处理
            });
            this.dragControls.addEventListener('dragend', () => {
                this.controls.enabled = true
            });
        } else {
            if (this.dragControls) {
                this.dragControls.dispose()
            }
        }
    }

    setNowModel({ id, modelName }) {
        // store.llObj.b = store.modelMeshList.length
        if (id) {
            // 切换选中的模型
            let mo = this.getObjectById(id);
            store.selectModel = mo;
            store.selectModel_Id = mo.id;

            // 更新Mesh列表
            store.modelMeshList = [];
            mo.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    store.modelMeshList.push(child);
                }
            })
            store.selectMesh = {};
            store.selectMaterial = {};


            // 更新Material列表
            let temp = store.modelList.find(item => item.id == id)
            store.modelMaterialList = [];
            this.setMaterialList(temp.MaterialList)
            // this.getModelMeaterialList(temp.MaterialList)
            // console.log(modelMaterialList);
            // console.log(temp);
            // console.log(mo);

        } else if (modelName) {

        }
        this.onSetModelDrag(false)
    }

    resetCamera() {
        this.controls.enabled = false
        new TWEEN.Tween(this.camera.position)
            .to({ x: 30, y: 6, z: 0 }, 500) // 目标位置和持续时间
            .easing(TWEEN.Easing.Quadratic.InOut) // 缓动函数
            .onComplete(() => {
                this.controls.enabled = true
            })
            .start(); // 开始动画
    }

    setMaterialList(MaterialList) {
        store.selectModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // // 判断是否存在于用户新增材质的缓存里
                // for (let i = 0; i < LLlocalModel_newMaterial.length; i++) {
                //     const element = LLlocalModel_newMaterial[i];
                //     if (element.user.indexOf(child.name) != -1) { //是则修改材质名为缓存名
                //         child.material = child.material.clone()
                //         child.material.name = element.MaterialName;
                //     }
                // }
                if (store.modelMaterialList.some(obj => obj.name === child.material.name)) {
                    child.material = store.modelMaterialList.filter(obj => obj.name === child.material.name)[0]
                    child.material.needsUpdate = true;
                } else {
                    // child.material.depthWrite = true; //材质深写入
                    store.modelMaterialList.push(child.material);
                }
            }
        })

    }





}


export default renderModel





