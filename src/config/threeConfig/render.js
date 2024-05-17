import * as THREE from "three";
import { CSS3DRenderer, CSS3DSprite, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

const xf_addCamera = (foc, near, far, isTest) => {
  //焦距 近点 远点 是否测试相机
  const camera = new THREE.PerspectiveCamera(foc, window.innerWidth / window.innerHeight, near, far);

  const xf_testRender = (camera) => {
    function renderCamera() {
      console.log("相机x+" + camera.position.x + "+相机y" + camera.position.y + "+相机z+" + camera.position.z);
    }
    document.addEventListener("mousemove", renderCamera);
  };
  if (isTest) {
    xf_testRender(camera);
  }
  return camera;
};

const xf_addDefaultRender = (isRgb, model, exposure, renderNumber) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", precision: "highp" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  if (isRgb) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  switch (model) {
    case 1:
      renderer.toneMapping = THREE.LinearToneMapping;
      break;
    case 2:
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      break;
    case 3:
      renderer.toneMapping = THREE.ReinhardToneMapping;
      break;
    default:
      renderer.toneMapping = THREE.NoToneMapping;
  }
  renderer.toneMappingExposure = exposure;

  if (renderNumber) {
    renderer.sortObjects = false; //定义渲染器是否应对对象进行排序。默认是true. 不再透明度排序，从而修补透明度 显示bug
  }
  return renderer;
};

const xf_addCss3dRender = () => {
  const CSS3renderer = new CSS3DRenderer(); //渲染css的htlm对象
  CSS3renderer.setSize(window.innerWidth, window.innerHeight);
  return CSS3renderer;
};

const xf_addManager = (test) => {
  const manager = new THREE.LoadingManager(); //定义加载跟踪容器
  if (test) {
    manager.onStart = function (url, itemsLoaded, itemsTotal) {
      console.log("载入的模型: " + url + ".\n目前已加载项的个数。 " + itemsLoaded + " 总共所需要加载项的个数 " + itemsTotal + " 文件");
    };

    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      // UidApp.loadWidthev = itemsLoaded / itemsTotal * 1//环境加载速度---

      console.log("载入的模型: " + url + ".\n目前已加载项的个数 " + itemsLoaded + " 总共所需要加载项的个数 " + itemsTotal + " 文件进度");
    };
    manager.onError = function (url) {
      console.log("加载失败");
    };
    manager.onLoad = function () {
      console.log("所有物料加载成功");
    };
  }
  return manager;
};

const xf_restView = (renderer, camera) => {
  function onWindowResize() {
    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    // CSS3renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onWindowResize); //添加窗口改变相机刷新时间
};

export { xf_addCamera, xf_addDefaultRender, xf_addCss3dRender, xf_addManager, xf_restView };
