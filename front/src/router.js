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
            path: '/sudo',
            name: 'sudo',
            component: () => import('./views/SudoLogin.vue')
        },
        {
            path: '/sudo-main',
            name: 'sudoMain',
            component: () => import('./views/SudoMain.vue')
        },
        {
            path: '/join',
            name: 'join',
            component: () => import('./views/Join.vue')
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('./views/AdminJoin.vue')
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
                    name: 'mainHome',
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
                    path: 'leaderboard',
                    name: 'leaderboard',
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/Leaderboard.vue')
                    }
                },
                {
                    path: 'party-view',
                    name: 'party-view',
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/PartyView.vue')
                    }
                },
                {
                    path: 'admin',
                    name: 'party-admin',
                    components: {
                        default: () => import('./views/Main.vue'),
                        content: () => import('./views/AdminPartyViewMain.vue')
                    }
                }
            ]

        }
    ]
})
