import Vue from 'vue';
import Router from 'vue-router';
import Login from './views/Login.vue';

Vue.use(Router);

const requireAuth = () => (from, to, next) => {
  if (JSON.parse(sessionStorage.getItem('vuex')) !== null) {
    return next();
  }
  return next('/');
};

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/checkin',
      name: 'CheckIn',
      component: () => import( /* webpackChunkName: "CheckIn" */ './views/CheckIn.vue'),
      beforeEnter: requireAuth()
    },
    {
      path: '/mywallet',
      name: 'MyWallet',
      component: () => import( /* webpackChunkName: "MyWallet" */ './views/MyWallet.vue'),
      beforeEnter: requireAuth()
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: () => import( /* webpackChunkName: "CheckIn" */ './views/SignUp.vue'),
      beforeEnter: requireAuth()
    },
    {
      path: '*',
      component: () => import( /* webpackChunkName: "NotFound" */ './views/NotFound.vue'),
    }
  ],
});