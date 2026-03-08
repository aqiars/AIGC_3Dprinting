import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Upload from '../views/Upload.vue';
import Preview from '../views/Preview.vue';
import Order from '../views/Order.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/upload', component: Upload },
  { path: '/preview', component: Preview },
  { path: '/order', component: Order },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;