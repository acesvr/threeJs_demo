
<template>
  <!-- <router-view></router-view> -->

  <n-loading-bar-provider>
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </n-loading-bar-provider>
</template>
<script setup>
import { NLoadingBarProvider, NMessageProvider, useMessage } from 'naive-ui'



</script>

<style>
body {
  background-color: rgb(191, 230, 243);
  padding: 0;
  margin: 0;
}
</style>
