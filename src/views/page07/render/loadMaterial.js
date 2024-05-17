import * as THREE from 'three';



var jinshu01_material, jinshu02_material, tianliao_material;

const initMaterial = () => {
    //jinshu01_material  不锈钢 jinshu01
    jinshu01_material = new THREE.MeshPhysicalMaterial({
        reflectivity: 1,//反射率
        color: new THREE.Color(0xbbbbbb),
        side: THREE.DoubleSide,
        metalness: 1,
        roughness: 0.3,// 粗糙度，0表示完全光滑
        // "ior": 1.52,
        // "thickness": 0.8,
        // "specularIntensity": 3,
    });



    //jinshu02 漆面01
    jinshu02_material = new THREE.MeshPhysicalMaterial({
        side: THREE.DoubleSide,

        color: new THREE.Color(0xB76B00),
        transparent: true,
        metalness: 1,
        roughness: 0.4, // 粗糙度，0表示完全光滑

        // metalness: 0.5,
        // reflectivity: 0.7, //反射率，由0.0到1.0。默认为0.5, 相当于折射率1.5。这模拟了非金属材质的反射率。当metalness为1.0时，此属性无效。
    });





    //材质6
    tianliao_material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x573614),
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
    jinshu01_material, jinshu02_material, tianliao_material
}