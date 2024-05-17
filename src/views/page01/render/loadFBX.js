import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';


const fbxArr = {
    fbx: [], //加载列表fbx格式
    path: '', //路径
    obj: [] //加载结束拿到的obj
}
fbxArr.fbx = ['gydj_animation002.fbx']
fbxArr.path = '/models/'

var gydjModel

for (let i = 0; i < fbxArr.fbx.length; i++) {
    loader.load(fbxArr.fbx[i],
        (object) => {
            fbxArr.obj[i] = object
        }, function (xhr) {
            console.log((xhr.loaded / xhr.total) + '% 模型加载');
        }
    )
}

new FBXLoader().setPath('/models/').load('gydj_animation002.fbx',
    function (object) {
        gydjModel = track(object)
    }
)


export { gydjModel }