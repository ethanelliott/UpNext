<template>
    <v-app color="accent" dark>
        <v-content>
            <v-container fill-height fluid>
                <v-layout align-center justify-center>
                    <v-flex lg6 md8 sm8 xs10>
                        <v-card class="elevation-12" color="secondary">
                            <v-card-text>
                                <v-container column grid-list-xl>
                                    <v-layout>
                                        <v-flex>
                                            <v-card color="secondary" flat>
                                                <v-card-text>
                                                    <p class="text-xs-center big-text text-uppercase">
                                                        <span>Up</span>
                                                        <span class="font-weight-light">Next</span>
                                                    </p>
                                                </v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout>
                                        <v-flex>
                                            <p class="text-xs-center text-uppercase">
                                                <span>Give your party a Name:</span>
                                            </p>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout>
                                        <v-flex>
                                            <v-card color="secondary" flat>
                                                <v-card-text>
                                                    <v-text-field :disabled="disableTextInput" box full-width label="Party Name"
                                                                  v-model="partyName"></v-text-field>
                                                    <v-btn :loading="isLoadingButton" @click="validateCode" block color="primary" dark
                                                           large>
                                                        <span>
                                                            Create
                                                        </span>
                                                    </v-btn>
                                                </v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import axios from 'axios'
    import session from 'sessionstorage'
    import querystring from 'querystring'

    const client_id = 'dd8b5386683d47cc9d955a00c1a9c3f8';
    const redirect_uri = 'http://localhost:8888/party/auth-callback';
    const scope = 'user-read-private user-read-email user-library-read user-library-modify playlist-read-private streaming app-remote-control user-modify-playback-state user-read-currently-playing user-read-playback-state playlist-modify-public playlist-modify-private';

    export default {
        name: "Start",
        data: () => ({
            partyName: null,
            disableTextInput: false,
            isLoadingButton: false
        }),
        mounted() {
            session.clear()
        },
        methods: {
            setLoading() {
                this.isLoadingButton = true
                this.disableTextInput = true
            },
            setNotLoading() {
                this.isLoadingButton = false
                this.disableTextInput = false
            },
            validateCode() {
                let context = this
                context.setLoading()
                axios
                    .post('/party/new-party', {
                        name: context.partyName
                    })
                    .then(function (response) {
                        let d = response.data
                        session.clear()
                        session.setItem('partyID', d.id)
                        let url = 'https://accounts.spotify.com/authorize?' +
                            querystring.stringify({
                                response_type: 'code',
                                client_id: client_id,
                                scope: scope,
                                redirect_uri: redirect_uri,
                                state: d.id
                            })
                        window.location.href = url
                    })
                    .catch(function (err) {
                        console.error(err)
                    })
            }
        }
    }
</script>

<style scoped>
    .big-text {
        font-size: 3em;
    }
</style>
