<template>
    <v-container fluid>
        <v-layout v-if="loading" justify-center align-center>
            <v-flex class="text-xs-center">
                <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
            </v-flex>
        </v-layout>
        <v-layout v-if="!loading" justify-center>
            <v-flex lg8 md10 sm10 xs12>
                <v-list subheader>
                    <v-subheader>Leaderboard</v-subheader>
                    <template v-for="(user, index) in users">
                        <v-list-tile :key="user.title" avatar>
                            <v-list-tile-avatar tile>
                                <v-btn flat icon>
                                    <span>{{ index + 1 }}</span>
                                </v-btn>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ user.nickname }}</v-list-tile-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-btn flat icon color="primary">
                                    <span>{{ user.score }}</span>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                        <v-divider
                                v-if="index + 1 < users.length"
                                :key="index"
                        ></v-divider>
                    </template>
                </v-list>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    const PROD = false
    import io from 'socket.io-client'
    import session from 'sessionstorage'
    import * as Vibrant from 'node-vibrant'
    export default {
        name: "Leaderboard",
        data: () => ({
            socket: null,
            loading: false,
            partyID: null,
            users: []
        }),
        beforeDestroy() {
            this.socket.disconnect()
            clearInterval(this.eventLoop)
        },
        mounted() {
            let t = this
            t.socket = io((PROD ? 'http://api.upnext.ml' : 'http://localhost:8888'))
            t.partyID = session.getItem('partyID')
            t.eventLoop = setInterval(function() {
                t.socket.emit('get-leaderboard', {id: t.partyID})
            }, 500)
            t.socket.on('give-leaderboard', (data) => {
                t.users = data.users
            })
        },
        methods: {
        }
    }
</script>
