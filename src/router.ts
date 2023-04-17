import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/home',
    name: 'home',
    component: () => import('@/pages/home/index.vue'),
  },
  {
    path: '/header',
    name: 'header',
    component: () => import('@/pages/request-header/index.vue'),
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: () => import('@/pages/detail/index.vue'),
  },
  {
    path: '/blacklist',
    name: 'blacklist',
    component: () => import('@/pages/blacklist/index.vue'),
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/pages/test/index.vue'),
  },
];

export const beforeEachHandlers = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.path === '/' && typeof to.name === 'undefined') {
    next({
      name: 'home',
    });
    return;
  }
  next();
};

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(beforeEachHandlers);

export default router;
