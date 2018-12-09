import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./views/LandingPage.vue')
        },
        {
            path: '/join',
            name: 'join',
            component: () => import('./views/Join.vue')
        },
        {
            path: '/start',
            name: 'start',
            component: () => import('./views/Start.vue')
        },
        {
            path: '/callback',
            name: 'callback',
            component: () => import('./views/Callback.vue')
        },
        {
            path: '/logout',
            name: 'logout',
            component: () => import('./views/Logout.vue')
        },
        {
            path: '/main',
            name: 'main',
            components: {
                default: () => import('./views/Main.vue'),
                content: () => import('./views/Home.vue')
            },
            children: [
                {
                    path: 'home',
                    name: 'home',
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Home.vue')
                    },
                },
                {
                    path: 'queue',
                    name: 'queue',
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Queue.vue')
                    }
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
