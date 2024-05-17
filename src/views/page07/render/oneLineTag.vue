<!--
 * @Author: xiefan 4033638634@qq.com
 * @Date: 2023-05-22 23:53:01
 * @LastEditors: xiefan2333 1668903208@qq.com
 * @LastEditTime: 2023-05-30 22:10:23
 * @FilePath: \7e:\project\2023\5\21 threejs解耦\xiefan\src\components\threejsDisplay\threeScene1\model\tag\oneLineTag.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup >
import { reactive, toRefs, ref, computed, onMounted, defineEmits } from 'vue'
import { CSS3DRenderer, CSS3DSprite, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { cloneObj } from './cloneObj'

let Tag = {
    div: null,
    p: null,
    height: null,
    w: 100,
    e: 150,
    cc: null,
    times: null,
    timee: null,
    offw: null
}
let exportTag = null


const seedmsg = defineEmits(['sendTag', 'send3Dtag'])

const exportBTN = (tag, fn) => {
    seedmsg('sendTag', tag)
    //第一个自定义函数名称 -传过去得值
    seedmsg('send3Dtag', fn)
}


// console.log(seedmsg);
onMounted(() => {

    Tag.div = document.getElementsByClassName('tag')
    Tag.p = Tag.div[0].querySelectorAll('p');
    // console.log(Tag.p);

    Tag.height = Tag.div[0].getElementsByClassName('bgheight')
    Tag.cc = Tag.div[0].getElementsByClassName('bg')
    Tag.height[0].style.marginLeft = '100px'
    // console.log(Tag.cc[0]);


    //鼠标悬浮动画封装
    const startAnimal = () => {
        clearInterval(Tag.times);

        // Tag.w = 100
        Tag.w = parseInt(Tag.height[0].style.marginLeft)

        Tag.times = setInterval(() => {
            // console.log(parseInt(Tag.height[0].style.marginLeft));
            Tag.w += 0.2
            Tag.offw = Tag.w + 'px'
            if (Tag.w <= 150) {
                Tag.height[0].style.marginLeft = Tag.offw
                // console.log('变化' + Tag.w);
            }
        }, 8);

    }
    const endAnimal = () => {
        clearInterval(Tag.timee);
        // Tag.height[0].style.marginLeft = 100 + 'px'

        let start = false
        Tag.timee = setInterval(() => {
            if (Tag.w > 149 && Tag.w < 150) {
                start = true
                console.log('启动');
                Tag.e = 150
            }
            if (start) {
                Tag.e -= 0.2
                let offw = Tag.e + 'px'
                if (Tag.e >= 100) {
                    Tag.height[0].style.marginLeft = offw
                    // console.log('变化');
                }
            }
        }, 8);

    }
    // Tag.cc[0].addEventListener('pointerover', startAnimal)
    // Tag.cc[0].addEventListener('pointerout', endAnimal)

    Tag.p[0].innerHTML = '信息展示'
    Tag.p[1].innerHTML = 'natural science'

    let DomJ = new cloneObj()


    const setTagString = (contendt1, contendt2) => {
        // TagT.yangben=Tag.div[0].cloneNode(true);
        DomJ.yangben = Tag.div[0].cloneNode(true);
        let hang1 = DomJ.yangben.querySelectorAll('p');
        hang1[0].innerHTML = contendt1
        hang1[1].innerHTML = contendt2

        return DomJ.yangben
    }
    exportBTN(setTagString)
    // console.log(exportTag);


})




</script>
<template>
    <div>
        <div class="tag">
            <div class="bg"></div>
            <div class="sizeb" style="overflow: hidden;">
                <div class="bgheight"></div>
            </div>
            <div class="boderB"></div>
            <div class="text">
                <p>科技内容</p>
                <p class="fontSet"> Technological content</p>
            </div>
        </div>


    </div>
</template>
  

<style scoped lang='less'>
@widthB: 300px;
@heightB: 80px;
@BgColor: rgb(9, 177, 255);
@BoderColor: rgb(102, 219, 255);
@TextColor: rgb(255, 255, 255);

.tag {
    .sizeb;
    // top: -40px;
    // left: -150px;
    pointer-events: none;
}

.sizeb {
    width: @widthB;
    height: @heightB;
    top: 0px;
    left: 0px;
    position: absolute;
}

.text {
    .sizeb;
    color: @TextColor;
    display: flex;
    text-align: center;
    // line-height: @heightB;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;
    letter-spacing: 4px;
    font-size: 25px;

}

.fontSet {
    font-size: 8px;
    padding: 2px;
    letter-spacing: 3px;
}


.bg {
    .sizeb;
    background-color: @BgColor;
    opacity: 0.15;
    pointer-events: auto;


}

.bgheight {
    .bg;
    clip-path: polygon(0 0, 85% 0, 100% 100%, 0% 100%);
    transform: scaleX(-1);
    mix-blend-mode: additive;
    margin-left: 100px;
    pointer-events: none;

}

.boderB {
    .sizeb;
    border: 0.2px solid @BoderColor;
    opacity: 0.5;
}
</style>
