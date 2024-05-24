<template>
  <div class="overlay">
    <div v-if="store.showProgress" class="progressNum">{{ progress }}%...</div>

    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <div class="loader">
            <div class="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div class="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div class="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div class="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="progressNum2">
      <div class="textUrl">loading: {{ store.L_Loading_Url }}</div>
      <!-- <div>loaded &lt;{{ store.L_Loading_Loaded }}> of &lt;{{ store.L_Loading_Total }}> files.</div> -->
    </div>
  </div>
</template>

<script>
import { useStore } from "@/store";
export default {
  props: {
    progress: {
      type: String,
      default: "0",
      required: true,
    },
  },

  setup() {
    const store = useStore();

    return {
      store,
    };
  },
};
</script>

<style lang="less">
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background-color: #352b23;
  background-image: url("/public/Bg/bg_checker.png");
  /* 透明黑色背景 */
  z-index: 9999;
  /* 确保遮罩层覆盖在其他元素之上 */
  backdrop-filter: blur(10px);
  /* 模糊度可以根据需要进行调整 */
  pointer-events: none;
}

.progressNum {
  position: absolute;
  width: 300px;
  height: 100px;
  top: 40%;
  left: 50%;
  margin-left: -150px;
  text-align: center;
  color: #fff;

  background-image: linear-gradient(to right, #ffffff, #0004ff);
  /* 渐变色的起始和结束颜色可以根据需要进行调整 */
  background-clip: text;
  -webkit-background-clip: text;
  /* 兼容Webkit浏览器 */
  color: transparent;
  font-size: 22px;
  font-weight: 600;
}

.progressNum2 {
  position: absolute;
  width: 300px;
  top: 38%;

  left: 50%;
  margin-left: -150px;
  text-align: center;
  color: #fff;

  background-image: linear-gradient(to right, #ffffff, #0004ff);
  /* 渐变色的起始和结束颜色可以根据需要进行调整 */
  background-clip: text;
  -webkit-background-clip: text;
  /* 兼容Webkit浏览器 */
  color: transparent;
  font-size: 1.2rem;
  font-weight: 600;

  .textUrl {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 0.8rem;
  }
}

.loader {
  --size: 32px;
  --duration: 800ms;
  width: 96px;
  height: 64px;
  margin: 50px auto;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
  position: absolute;
  top: 40%;
  left: 50%;
  margin-left: -48px;
}

.loader .box {
  width: 32px;
  height: 32px;
  transform-style: preserve-3d;
  position: absolute;
  top: 0;
  left: 0;
}

.loader .box:nth-child(1) {
  transform: translate(100%, 0);
  animation: box1 800ms linear infinite;
}

.loader .box:nth-child(2) {
  transform: translate(0, 100%);
  animation: box2 800ms linear infinite;
}

.loader .box:nth-child(3) {
  transform: translate(100%, 100%);
  animation: box3 800ms linear infinite;
}

.loader .box:nth-child(4) {
  transform: translate(200%, 0);
  animation: box4 800ms linear infinite;
}

.loader .box > div {
  --translateZ: calc(var(--size) / 2);
  --rotateY: 0deg;
  --rotateX: 0deg;
  background: #5c8df6;
  width: 100%;
  height: 100%;
  transform: rotateY(var(--rotateY)) rotateX(var(--rotateX)) translateZ(var(--translateZ));
  position: absolute;
  top: auto;
  right: auto;
  bottom: auto;
  left: auto;
}

.loader .box > div:nth-child(1) {
  top: 0;
  left: 0;
}

.loader .box > div:nth-child(2) {
  background: #145af2;
  right: 0;
  --rotateY: 90deg;
}

.loader .box > div:nth-child(3) {
  background: #447cf5;
  --rotateX: -90deg;
}

.loader .box > div:nth-child(4) {
  background: #dbe3f4;
  top: 0;
  left: 0;
  --translateZ: calc(var(--size) * 3 * -1);
}

@keyframes box1 {
  0%,
  50% {
    transform: translate(100%, 0);
  }

  100% {
    transform: translate(200%, 0);
  }
}

@keyframes box2 {
  0% {
    transform: translate(0, 100%);
  }

  50% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(100%, 0);
  }
}

@keyframes box3 {
  0%,
  50% {
    transform: translate(100%, 100%);
  }

  100% {
    transform: translate(0, 100%);
  }
}

@keyframes box4 {
  0% {
    transform: translate(200%, 0);
  }

  50% {
    transform: translate(200%, 100%);
  }

  100% {
    transform: translate(100%, 100%);
  }
}
</style>
