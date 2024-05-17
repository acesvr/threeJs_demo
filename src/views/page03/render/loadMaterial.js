import * as THREE from 'three';
import { track } from './track'


var buxiugang_material, qimian01_material, suliao_material;

const initMaterial = () => {
    //buxiugang_material  不锈钢
    buxiugang_material = new THREE.MeshPhysicalMaterial({
        reflectivity: 1,//反射率
        color: new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
        metalness: 1,
        roughness: 1,
        // "ior": 1.52,
        // "thickness": 0.8,
        // "specularIntensity": 3,
    });
    buxiugang_material.map = track(new THREE.TextureLoader().load('/models/jzkgydj/tex/buxiugang_BaseColor.png'));

    buxiugang_material.roughnessMap = track(new THREE.TextureLoader().load('/models/jzkgydj/tex/buxiugang_Roughness.png'));
    // buxiugang_material.roughnessMap.encoding = THREE.sRGBEncoding; //这属性像不锈钢
    buxiugang_material.metalnessMap = track(new THREE.TextureLoader().load('/models/jzkgydj/tex/buxiugang_Metallic.png'));
    buxiugang_material.aoMap = track(new THREE.TextureLoader().load('/models/jzkgydj/tex/buxiugang_AO.png'));
    // buxiugang_material.aoMapIntensity = 1;
    // buxiugang_material.envMapIntensity = 1;


    //qimian01_material 漆面01
    qimian01_material = new THREE.MeshPhysicalMaterial({
        side: THREE.DoubleSide,
        map: track(new THREE.TextureLoader().load('/models/jzkgydj/tex/qimian01_BaseColor.png')),
        // roughnessMap: track(new THREE.TextureLoader().load('/models/jzkgydj/tex/qimian01_Roughness.png')),
        // metalnessMap: track(new THREE.TextureLoader().load('/models/jzkgydj/tex/qimian01_Metallic.png')),
        aoMap: track(new THREE.TextureLoader().load('/models/jzkgydj/tex/qimian01_AO.png')),
        aoMapIntensity: 1,
        transparent: true,
        // color: 0xffffff, // 模型的基础颜色
        roughness: 0.4, // 粗糙度，0表示完全光滑
        metalness: 0, // 金属度，1表示完全金属
        wireframe: false,//线框
        // metalness: 0.5,
        // reflectivity: 0.7, //反射率，由0.0到1.0。默认为0.5, 相当于折射率1.5。这模拟了非金属材质的反射率。当metalness为1.0时，此属性无效。
    });
    qimian01_material.color = new THREE.Color("rgb(102,102,102)");

    // qimian01_material.metalnessMap.encoding = THREE.sRGBEncoding;
    // qimian01_material.aoMapIntensity = 1;
    // qimian01_material.roughnessMap.wrapS = THREE.RepeatWrapping;
    // qimian01_material.roughnessMap.wrapT = THREE.RepeatWrapping;


    //材质6
    suliao_material = new THREE.MeshPhysicalMaterial({
        map: track(new THREE.TextureLoader().load('/models/jzkgydj/tex/suliao_BaseColor.png')),
        // metalnessMap: track(new THREE.TextureLoader().load('/models/jzkgydj/tex/suliao_Metallic.png')),
        aoMap: track(new THREE.TextureLoader().load('/models/jzkgydj/tex/suliao_AO.png')),
        // roughnessMap: track(new THREE.TextureLoader().load('/models/jzkgydj/tex/suliao_Roughness.png')),
        side: THREE.DoubleSide,
        transparent: true,
        roughness: 0.4, // 粗糙度，0表示完全光滑
        metalness: 0, // 金属度，1表示完全金属
        // roughness: 1,
        // metalness: 0.5,
    });
}

initMaterial()

export {
    buxiugang_material, qimian01_material, suliao_material
}