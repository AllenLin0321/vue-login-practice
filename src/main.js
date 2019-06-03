import axios from 'axios'
import Vue from 'vue'
import App from './App.vue'

import router from './router'
import store from './store'

Vue.use(axios);
axios.defaults.baseURL = 'https://vue-axios-9d321.firebaseio.com';

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
