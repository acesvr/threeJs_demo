import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';




var hdr = new RGBELoader().setDataType(THREE.FloatType)
    .load('/hdr/startup.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping; //专门针对金属反射映射贴图
    })

function changeHDR() {

}


export { hdr, changeHDR }