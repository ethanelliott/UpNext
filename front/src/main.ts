import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import vuetify from './plugins/vuetify';
import axios from 'axios';
import LogRocket from 'logrocket';

LogRocket.init('ayfxcp/upnext');

const LOCAL_URI = `http://192.168.1.58`;
const PROD = process.env.NODE_ENV !== 'development';
const API_URL = (PROD ? 'https://upnext-api.herokuapp.com/api' : `${LOCAL_URI}:8884/api`);
const SOCKET_URL = (PROD ? 'https://upnext-api.herokuapp.com' : `${LOCAL_URI}:8884`);
const FRONT_URL = (PROD ? 'https://upnext.bar' : `${LOCAL_URI}:8080`);

axios.defaults.baseURL = API_URL;

Vue.prototype.$PROD = PROD;
Vue.prototype.$apiUrl = API_URL;
Vue.prototype.$socketUrl = SOCKET_URL;
Vue.prototype.$frontUrl = FRONT_URL;

Vue.config.productionTip = false;

new Vue({
    router,
    // @ts-ignore
    vuetify,
    render: (h: any) => h(App)
}).$mount('#app');