import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import App from './App.vue';
import router from './router';
import axios from 'axios';

Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [createPersistedState({ storage: window.sessionStorage })],
  state: {
    userInfo: null,
    token: null
  },
  mutations: {
    setUserData(state, userInfo) { //Login
      state.userInfo = userInfo;
    },
    clearUserData(state) { //Logout
      state.userInfo = null;
    },
    setTokenData(state, token) {
      state.token = token;
    },
    clearTokenData(state) {
      state.token = null;
    }
  },
  actions: {
    async setUserData ({commit}, {email, password}) {
      const loginData = await axios.post(`${process.env.VUE_APP_API_HOST_URL}/api/${process.env.VUE_APP_API_VER}/auth/login`, {
        id: email,
        pw: password
      });
      if(!loginData || !loginData.data.data) {
        alert('Invalid login information.');
        return false;
      }
      commit('setUserData', loginData.data.data.userInfo);
      commit('setTokenData', loginData.data.data.token);
      return loginData;
    },
    clearUserData ({commit}) {
      commit('clearUserData');
      commit('clearTokenData');
    }
  }
});

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app');