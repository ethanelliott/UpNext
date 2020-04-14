import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import vuetify from './plugins/vuetify';
import axios from 'axios';

Vue.config.productionTip = false;

const PROD = process.env.NODE_ENV !== 'development';

axios.defaults.baseURL = (PROD ? 'https://api.upnext.cool/api' : 'http://192.168.69.100:8884/api');
Vue.prototype.$socketPath = (PROD ? 'https://socket.upnext.cool' : 'http://192.168.69.100:8885');
Vue.config.productionTip = false;

Vue.prototype.$PROD = PROD;
Vue.prototype.$API_URL = (PROD ? 'https://api.upnext.cool/api' : 'http://192.168.69.100:8884/api');

new Vue({
    router,
    // @ts-ignore
    vuetify, // vuetify has no nice type definitions
    render: h => h(App)
}).$mount('#app');
