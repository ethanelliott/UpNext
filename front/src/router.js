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
            props: (route) => ({code: route.query.c}),
            component: () => import('./views/Join.vue')
        },
        {
            path: '/start',
            name: 'start',
            component: () => import('./views/Start.vue')
        },
        {
            path: '/logout',
            name: 'logout',
            component: () => import('./views/Logout.vue')
        },
        {
            path: '/m',
            name: 'm',
            components: {
                default: () => import('./views/Main.vue'),
                content: () => import('./views/Home.vue')
            },
            redirect: '/m/home',
            children: [
                {
                    path: 'home',
                    name: 'Home',
                    props: {default: false, content: true},
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Home.vue')
                    },
                },
                {
                    path: 'home/:tqueue',
                    name: 'Home',
                    props: {default: false, content: true},
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Home.vue')
                    },
                },
                {
                    path: 'home/:tqueue/:tadd',
                    name: 'Home',
                    props: {default: false, content: true},
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Home.vue')
                    },
                },
                {
                    path: 'home/:tqueue/:tadd/:taddtab',
                    name: 'Home',
                    props: {default: false, content: true},
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Home.vue')
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
