import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import vuetify from './plugins/vuetify';
import axios from 'axios';

Vue.config.productionTip = false;

const PROD = false;

axios.defaults.baseURL = (PROD ? 'https://api.upnext.cool/api' : 'http://localhost:8884/api');
Vue.prototype.$socketPath = (PROD ? 'https://socket.upnext.cool' : 'http://localhost:8885');
Vue.config.productionTip = false;


new Vue({
    router,
    // @ts-ignore
    vuetify, // vuetify has no nice type definitions
    render: h => h(App)
}).$mount('#app');
