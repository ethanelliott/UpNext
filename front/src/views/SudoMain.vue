<template>
    <v-app dark>
        <v-navigation-drawer app fixed v-model="drawer">
            <v-toolbar color="primary" dark>
                SUDO NANO
            </v-toolbar>
            <v-divider></v-divider>
            <v-list>
                <v-list-tile to="/sudo-main">
                    <v-list-tile-action>
                        <v-icon>home</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Home</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <!--<v-list-tile to="/main/queue">-->
                <!--<v-list-tile-action>-->
                <!--<v-icon>add</v-icon>-->
                <!--</v-list-tile-action>-->
                <!--<v-list-tile-content>-->
                <!--<v-list-tile-title>Queue</v-list-tile-title>-->
                <!--</v-list-tile-content>-->
                <!--</v-list-tile>-->
            </v-list>
            <v-divider></v-divider>
            <v-list>
                <v-list-tile to="/sudo-logout">
                    <v-list-tile-action>
                        <v-icon>exit_to_app</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Sudo Logout</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar app dark>
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title class="headline text-uppercase">
                <span>Up</span>
                <span class="font-weight-light">Next</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-title class="text-uppercase">
                <span style="letter-spacing: 10px;font-family: monospace;">~SUDO</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-content>

        </v-content>
    </v-app>
</template>

<script>
    // import session from 'sessionstorage'

    export default {
        name: "Main",
        data: () => ({
            drawer: null
        }),
        mounted() {

        }
    }
</script>

