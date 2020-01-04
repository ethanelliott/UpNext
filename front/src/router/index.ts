import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
    {
        path: '/eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9',
        name: 'admin',
        component: () => import('../views/AdminPage.vue')
    },
    {
        path: '/',
        name: 'home',
        component: () => import('../views/LandingPage.vue')
    },
    {
        path: '/join',
        name: 'join',
        props: (route: any) => ({code: route.query.c}),
        component: () => import('../views/JoinPage.vue')
    },
    {
        path: '/leave',
        name: 'leave',
        component: () => import('../views/LeavePage.vue')
    },
    {
        path: '/start',
        name: 'start',
        component: () => import('../views/StartPage.vue')
    },
    {
        path: '/make/:token',
        name: 'make',
        component: () => import('../views/MakePage.vue')
    },
    {
        path: '/app',
        name: 'app',
        components: {
            default: () => import('../views/app/Main.vue'),
            content: () => import('../views/app/Home.vue')
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
                    default: () => import('../views/app/Main.vue'),
                    content: () => import('../views/app/Home.vue')
                }
            },
            {
                path: 'search',
                name: 'appSearch',
                props: {
                    default: false,
                    content: true
                },
                components: {
                    default: () => import('../views/app/Main.vue'),
                    content: () => import('../views/app/Search.vue')
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
