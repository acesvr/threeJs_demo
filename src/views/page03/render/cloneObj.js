
import { CSS3DRenderer, CSS3DSprite, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
class cloneObj {
    constructor(yangben, obj, size, main) {
        this.yangben = yangben;
        this.obj = obj;
        this.size = size;
        this.main = main;
    }
}
const set3Dtag = (tag, size) => {
    let tag3D = new CSS3DObject(tag)
    tag3D.scale.set(size, size, size)
    return tag3D
}//设置3d标签的

// let hehe=new cloneObj()
// hehe.size=2
// console.log(hehe.size);


export { cloneObj, set3Dtag }