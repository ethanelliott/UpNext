import Vue from 'vue';
import VueRouter from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import JoinPage from '../views/JoinPage.vue';
import StartPage from '../views/StartPage.vue';
import MakePage from '../views/MakePage.vue';
// main application views
import Main from '../views/app/Main.vue';
import Home from '../views/app/Home.vue';
import Queue from '../views/app/Queue.vue';
import Add from '../views/app/Add.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'home',
        component: LandingPage
    },
    {
        path: '/join',
        name: 'join',
        component: JoinPage
    },
    {
        path: '/start',
        name: 'start',
        component: StartPage
    },
    {
        path: '/make/:token',
        name: 'make',
        component: MakePage
    },
    {
        path: '/app',
        name: 'app',
        components: {
            default: Main,
            content: Home
        },
        redirect: '/app/home',
        children: [
            {
                path: 'home',
                name: 'appHome',
                props: {
                    default: false,
                    content: true
                },
                components: {
                    default: Main,
                    content: Home
                }
            },
            {
                path: 'queue',
                name: 'appQueue',
                props: {
                    default: false,
                    content: true
                },
                components: {
                    default: Main,
                    content: Queue
                }
            },
            {
                path: 'add',
                name: 'appAdd',
                props: {
                    default: false,
                    content: true
                },
                components: {
                    default: Main,
                    content: Add
                }
            }
        ]
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router;
