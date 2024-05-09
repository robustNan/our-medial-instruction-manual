import { createRouter, createWebHistory } from "vue-router";
import MainView from "../views/main/";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "main",
      component: MainView,
    },
    {
      path: "/drag",
      name: "drag",
      component: () => import("../views/drag/PageView.vue"),
    },
    {
      path: "/fusion",
      name: "fusion",
      component: () => import("../views/FusionView.vue"),
    },
  ],
});

export default router;
