import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("../views/home.vue") },
  { path: "/home", component: () => import("../views/home.vue") },
  {
    path: "/page04",
    component: () => import("../views/page04/index.vue"),
    meta: {
      title: "三维编辑",
    },
  },
  { path: "/page02", component: () => import("../views/page02/index.vue") },
  { path: "/page05", component: () => import("../views/page05/index.vue") },
  {
    path: "/page06",
    component: () => import("../views/page06/index.vue"),
    meta: {
      title: "内嵌dom",
    },
  },
  {
    path: "/page07",
    component: () => import("../views/page07/index.vue"),
    meta: {
      title: "球阀",
    },
  },
  {
    path: "/page08",
    component: () => import("../views/page08/index.vue"),
    meta: {
      title: "管道流动demo",
    },
  },
  {
    path: "/page09",
    component: () => import("../views/page09/index.vue"),
    meta: {
      title: "视角器-viewHelper",
    },
  },
  {
    path: "/page10",
    component: () => import("../views/page10/index.vue"),
    meta: {
      title: "旗子飘动-着色器运用",
    },
  },
  {
    path: "/page11",
    component: () => import("../views/page11/index.vue"),
    meta: {
      title: "海洋着色器",
    },
  },
  {
    path: "/page12",
    component: () => import("../views/page12/index.vue"),
    meta: {
      title: "地面涟漪",
    },
  },
  {
    path: "/page13",
    component: () => import("../views/page13/index.vue"),
    meta: {
      title: "层级demo",
    },
  },
  {
    path: "/page14",
    component: () => import("../views/page14/index.vue"),
    meta: {
      title: "模拟钻孔数据顶点连线",
    },
  },
  {
    path: "/page15",
    component: () => import("../views/page15/index.vue"),
    meta: {
      title: "底座",
    },
  },
  // { path: '/uploadModel', component: () => import('../views/uploadModel/index.vue') },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
router.afterEach((to, from) => {
  document.title = to.meta.title || "3D展示demo";
});

export default router;
