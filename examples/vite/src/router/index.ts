import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainView
    },
    {
      path: '/dose',
      name: 'dose',
      component: () => import('../views/DoseView.vue')
    },
    {
      path: '/drag',
      name: 'drag',
      component: () => import('../views/drag_test_view/DragView.vue')
    },
    {
      path: '/fusion',
      name: 'fusion',
      component: () => import('../views/FusionView.vue')
    },
    {
      path: '/segmentation',
      name: 'segmentation',
      component: () => import('../views/SegmentationView.vue')
    }
  ]
})

export default router
