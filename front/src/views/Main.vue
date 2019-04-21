<template>
    <v-app dark>
        <!--        <v-navigation-drawer app fixed v-model="drawer">-->
        <!--            <v-toolbar dark color="primary">-->
        <!--                {{ name }}-->
        <!--            </v-toolbar>-->
        <!--            <v-divider></v-divider>-->
        <!--            <v-list>-->
        <!--                <v-list-tile to="/main/home">-->
        <!--                    <v-list-tile-action>-->
        <!--                        <v-icon>home</v-icon>-->
        <!--                    </v-list-tile-action>-->
        <!--                    <v-list-tile-content>-->
        <!--                        <v-list-tile-title>Home</v-list-tile-title>-->
        <!--                    </v-list-tile-content>-->
        <!--                </v-list-tile>-->
        <!--                <v-list-tile to="/main/queue">-->
        <!--                    <v-list-tile-action>-->
        <!--                        <v-icon>add</v-icon>-->
        <!--                    </v-list-tile-action>-->
        <!--                    <v-list-tile-content>-->
        <!--                        <v-list-tile-title>Queue</v-list-tile-title>-->
        <!--                    </v-list-tile-content>-->
        <!--                </v-list-tile>-->
        <!--                <v-list-tile to="/main/leaderboard">-->
        <!--                    <v-list-tile-action>-->
        <!--                        <v-icon>poll</v-icon>-->
        <!--                    </v-list-tile-action>-->
        <!--                    <v-list-tile-content>-->
        <!--                        <v-list-tile-title>Leaderboard</v-list-tile-title>-->
        <!--                    </v-list-tile-content>-->
        <!--                </v-list-tile>-->
        <!--                <v-list-tile v-if="admin" to="/main/party-view">-->
        <!--                    <v-list-tile-action>-->
        <!--                        <v-icon>visibility</v-icon>-->
        <!--                    </v-list-tile-action>-->
        <!--                    <v-list-tile-content>-->
        <!--                        <v-list-tile-title>Party View</v-list-tile-title>-->
        <!--                    </v-list-tile-content>-->
        <!--                </v-list-tile>-->
        <!--                <v-list-tile to="/main/admin" v-if="admin">-->
        <!--                    <v-list-tile-action>-->
        <!--                        <v-icon>settings</v-icon>-->
        <!--                    </v-list-tile-action>-->
        <!--                    <v-list-tile-content>-->
        <!--                        <v-list-tile-title>Admin</v-list-tile-title>-->
        <!--                    </v-list-tile-content>-->
        <!--                </v-list-tile>-->
        <!--            </v-list>-->
        <!--            <v-divider></v-divider>-->
        <!--            <v-list>-->
        <!--                <v-list-tile to="/logout">-->
        <!--                    <v-list-tile-action>-->
        <!--                        <v-icon>exit_to_app</v-icon>-->
        <!--                    </v-list-tile-action>-->
        <!--                    <v-list-tile-content>-->
        <!--                        <v-list-tile-title>Leave the party</v-list-tile-title>-->
        <!--                    </v-list-tile-content>-->
        <!--                </v-list-tile>-->
        <!--            </v-list>-->
        <!--        </v-navigation-drawer>-->
        <v-dialog fullscreen hide-overlay transition="slide-x-reverse-transition" v-model="settingsDialog">
            <v-card>
                <v-toolbar color="primary" dark>
                    <v-btn @click="settingsDialog = false" dark icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Settings</v-toolbar-title>
                </v-toolbar>
            </v-card>
        </v-dialog>
        <v-toolbar app dark>
            <v-icon color="primary">music_note</v-icon>
            <v-toolbar-title class="headline text-uppercase">
                <span>Up</span>
                <span class="font-weight-light">Next</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-title class="text-uppercase">
                <span style="letter-spacing: 10px;font-family: monospace;">{{ code }}</span>
            </v-toolbar-title>
            <v-btn @click="settingsDialog = true" dark icon>
                <v-icon>settings</v-icon>
            </v-btn>
        </v-toolbar>
        <v-content>
            <router-view name="content"></router-view>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'sessionstorage'

    export default {
        name: "Main",
        data: () => ({
            drawer: null,
            code: '',
            name: '',
            admin: false,
            settingsDialog: null
        }),
        mounted() {
            this.code = session.getItem('partyCode')
            this.name = session.getItem('partyName')
            this.admin = (session.getItem('admin') === 'true')
        }
    }
</script>

