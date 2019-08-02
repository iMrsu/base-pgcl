import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import qs from 'qs'
import Axios from 'axios'
import './assets/icon/iconfont.css'
import './assets/icon/iconfont.js'
import CryptoUtils from './assets/js/CryptoUtils.js'
Vue.prototype.axios = Axios
Vue.prototype.qs = qs
Vue.prototype.CryptoUtils = CryptoUtils //挂载到vue实例上
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: function(h) {
    return h(App)
  }
}).$mount('#app')
