import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '',
        name: 'transformateur',
        component: () => import('pages/TransformateurPage.vue') 
      },
      {
        path: 'poste-htbt',
        name: 'poste-htbt',
        component: () => import('pages/PosteHTBTPage.vue')
      },
      {
        path: 'tgbt',
        name: 'tgbt',
        component: () => import('pages/TGBTPage.vue')
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
