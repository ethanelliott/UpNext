<template>
    <v-container class="fill-height ma-0 pa-0" fluid>
        <v-navigation-drawer app class="accent-4" clipped dark height="100%" v-model="drawer">
            <v-list>
                <v-list-item :key="item.title" :to="item.href" link v-for="item in menuItems">
                    <v-list-item-icon>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <template v-slot:append>
                <div class="pa-2">
                    <v-btn block>BUTTON</v-btn>
                </div>
            </template>
        </v-navigation-drawer>
        <v-app-bar app clipped-left>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"/>
            <v-toolbar-title>
                <v-icon color="primary" left>mdi-music-note-plus</v-icon>
                UPNEXT Admin
            </v-toolbar-title>
            <v-spacer/>
            <v-toolbar-items>
                <app-admin-user-menu></app-admin-user-menu>
            </v-toolbar-items>
        </v-app-bar>
        <transition mode="out-in" name="fade">
            <router-view name="dashboard"/>
        </transition>
    </v-container>
</template>

<script>
    import sha512 from 'sha512';
    import axios from 'axios';
    import AppAdminUserMenu from "./adminUserButton";

    export default {
        name: "app-admin-dashboard",
        components: {AppAdminUserMenu},
        data: () => ({
            drawer: true,
            menuItems: [
                {
                    icon: 'mdi-home',
                    title: 'Home',
                    href: '/admin/dashboard/home'
                },
                {
                    icon: 'mdi-bell',
                    title: 'Updates',
                    href: '/admin/dashboard/updates'
                },
                {
                    icon: 'mdi-account',
                    title: 'Users',
                    href: '/admin/dashboard/users'
                },
                {
                    icon: 'mdi-music-note',
                    title: 'Parties',
                    href: '/admin/dashboard/parties'
                }
            ]
        }),
        mounted() {
            if (localStorage.getItem('admin-token')) {
                this.token = localStorage.getItem('admin-token');
                if (this.$route.name === 'adminDashboard') {
                    this.$router.push('/admin/dashboard/home');
                }
            } else {
                this.$router.push('/admin');
            }
        },
    }
</script>