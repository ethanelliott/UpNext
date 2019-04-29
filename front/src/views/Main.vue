<template>
    <v-app dark>
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
    import session from 'localStorage'

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

