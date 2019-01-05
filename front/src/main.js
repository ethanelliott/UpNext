import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import axios from 'axios'

const PROD = false

axios.defaults.baseURL = (PROD ? 'https://api.upnext.ml' : 'http://localhost:8888')
Vue.prototype.$socketPath = (PROD ? 'https://api.upnext.ml' : 'http://localhost:8888')
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
