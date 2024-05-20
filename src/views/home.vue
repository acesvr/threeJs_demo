<template>
  <div class="homePage">
    <div class="HomeTitle">demo</div>
    <div class="HomeContent">
      <!-- <ul>
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/page02">地质剖切</router-link></li>
        <li><router-link to="/page07">球阀(拖拽、切面)</router-link></li>
        <li><router-link to="/page08">管道流动demo</router-link></li>
        <li><router-link to="/page04">三维编辑</router-link></li>
        <li><router-link to="/page05">循环加载多个模型、创建tag标签</router-link></li>
        <li><router-link to="/page06">内嵌dom</router-link></li>
        <li><router-link to="/page09">视角器-viewHelper</router-link></li>
        <li><router-link to="/page10">旗子飘动-着色器运用</router-link></li>
        <li><router-link to="/page11">海洋着色器</router-link></li>
        <li><router-link to="/page12">地面涟漪</router-link></li>
        <li><router-link to="/page13">层级demo</router-link></li>
        <li><router-link to="/page14">模拟钻孔平台连线</router-link></li>
        <li><router-link to="/page15">底座</router-link></li>
      </ul> -->

      <ul>
        <li v-for="menu in pageArr">
          <router-link :to="menu.path">{{ menu.meta.title }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import router from "../router/router";

const pageArr = router.options.routes.filter((i) => i.meta?.title);
</script>

<style scoped>
.homePage {
  width: 100%;
  height: 100vh;
  /* background-image: url('../assets/image/treeBG.png'); */
  background-image: url("@/assets/image/treeBG.png");
  background-size: 100% 100%;
}

.HomeTitle {
  font-size: 30px;
  font-family: "Courier New", Courier, monospace;
}

.HomeContent {
  display: flex;
  gap: 20px;
}
</style>
