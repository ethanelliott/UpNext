import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
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
                path: 'cast',
                name: 'appCast',
                props: {
                    default: false,
                    content: true
                },
                components: {
                    default: () => import('../views/app/Main.vue'),
                    content: () => import('../views/app/Cast.vue')
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
    },
    {
        path: '/admin',
        name: 'admin',
        redirect: '/admin/login',
        components: {
            default: () => import('../views/AdminPage.vue'),
            content: () => import('../views/admin/login.vue')
        },
        children: [
            {
                path: 'login',
                name: 'adminLogin',
                props: {
                    default: false,
                    content: true
                },
                components: {
                    default: () => import('../views/AdminPage.vue'),
                    content: () => import('../views/admin/login.vue')
                }
            },
            {
                path: 'register',
                name: 'adminRegister',
                props: {
                    default: false,
                    content: true
                },
                components: {
                    default: () => import('../views/AdminPage.vue'),
                    content: () => import('../views/admin/register.vue')
                }
            },
            {
                path: 'dashboard',
                name: 'adminDashboard',
                props: {
                    default: false,
                    content: true
                },
                components: {
                    default: () => import('../views/AdminPage.vue'),
                    content: () => import('../views/admin/dashboard.vue')
                },
                children: [
                    {
                        path: 'home',
                        name: 'adminHome',
                        props: {
                            default: false,
                            content: true
                        },
                        components: {
                            default: () => import('../views/AdminPage.vue'),
                            content: () => import('../views/admin/dashboard.vue'),
                            dashboard: () => import('../views/admin/dashboard/home.vue')
                        }
                    },
                    {
                        path: 'updates',
                        name: 'adminUpdates',
                        props: {
                            default: false,
                            content: true
                        },
                        components: {
                            default: () => import('../views/AdminPage.vue'),
                            content: () => import('../views/admin/dashboard.vue'),
                            dashboard: () => import('../views/admin/dashboard/updates.vue')
                        }
                    },
                    {
                        path: 'users',
                        name: 'adminUsers',
                        props: {
                            default: false,
                            content: true
                        },
                        components: {
                            default: () => import('../views/AdminPage.vue'),
                            content: () => import('../views/admin/dashboard.vue'),
                            dashboard: () => import('../views/admin/dashboard/users.vue')
                        }
                    },
                    {
                        path: 'parties',
                        name: 'adminPartiesHome',
                        props: {
                            default: false,
                            content: false,
                            dashboard: true
                        },
                        components: {
                            default: () => import('../views/AdminPage.vue'),
                            content: () => import('../views/admin/dashboard.vue'),
                            dashboard: () => import('../views/admin/dashboard/partiesHome.vue')
                        },
                    },
                    {
                        path: 'parties/:id',
                        name: 'adminPartiesDetails',
                        props: {
                            default: false,
                            content: false,
                            dashboard: true
                        },
                        components: {
                            default: () => import('../views/AdminPage.vue'),
                            content: () => import('../views/admin/dashboard.vue'),
                            dashboard: () => import('../views/admin/dashboard/parties.vue')
                        },
                    },
                ]
            },
            {
                path: 'logout',
                name: 'adminLogout',
                props: {
                    default: false,
                    content: true
                },
                components: {
                    default: () => import('../views/AdminPage.vue'),
                    content: () => import('../views/admin/logout.vue')
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
