
import * as THREE from 'three'
import { track } from './track'
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

import { renderer, scene } from './render'
import { camera } from './camera'

var composer = new EffectComposer(renderer);        //效果组合器
//创建通道
var renderScene = new RenderPass(scene, camera);
//创建通道
var bloomPass = new UnrealBloomPass(
    //参数一：泛光覆盖场景大小，二维向量类型
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    //参数二：bloomStrength 泛光强度，值越大明亮的区域越亮，较暗区域变亮的范围越广
    1222.5,
    //参数三：bloomRadius 泛光散发半径
    1111.3,
    //参数四：bloomThreshold 泛光的光照强度阈值，如果照在物体上的光照强度大于该值就会产生泛光
    0.75
);

var params = {
    exposure: 0,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0,
};
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;
composer.addPass(renderScene);
composer.addPass(bloomPass);


export {
    composer
}