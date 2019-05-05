import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./views/LandingPage.vue')
        },
        {
            path: '/join',
            name: 'join',
            meta: {transitionName: 'slide'},
            props: (route) => ({code: route.query.c}),
            component: () => import('./views/Join.vue')
        },
        {
            path: '/start',
            name: 'start',
            meta: {transitionName: 'slide'},
            component: () => import('./views/Start.vue')
        },
        {
            path: '/logout',
            name: 'logout',
            meta: {transitionName: 'slide'},
            component: () => import('./views/Logout.vue')
        },
        {
            path: '/m',
            name: 'm',
            meta: {transitionName: 'slide'},
            components: {
                default: () => import('./views/Main.vue'),
                content: () => import('./views/Home.vue')
            },
            redirect: '/m/home',
            children: [
                {
                    path: 'home',
                    name: 'Home',
                    meta: {transitionName: 'slide'},
                    props: {default: false, content: true},
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Home.vue')
                    },
                },
                {
                    path: 'home/queue',
                    name: 'Home',
                    meta: {transitionName: 'slide'},
                    props: {default: false, content: true},
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Queue.vue')
                    },
                },
                {
                    path: 'home/queue/search',
                    name: 'Home',
                    meta: {transitionName: 'slide'},
                    props: {default: false, content: true},
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Search.vue')
                    },
                },
                {
                    path: 'party-view',
                    name: 'party-view',
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/PartyView.vue')
                    }
                }
            ]
        }
    ]
})
