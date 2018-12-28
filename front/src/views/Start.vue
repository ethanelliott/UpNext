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
                                            <v-form @submit="validateCode">
                                                <v-text-field :disabled="disableTextInput" box full-width label="Party Name"
                                                              v-model="partyName" :rules="[rules.required]"></v-text-field>
                                                <v-text-field :disabled="disableTextInput" box full-width label="Admin Password"
                                                              v-model="partyAdminPassword" :rules="[rules.required]"></v-text-field>
                                                <v-btn :loading="isLoadingButton" @click="validateCode" block color="primary" dark
                                                       large type="submit">
                                                        <span>
                                                            Create
                                                        </span>
                                                </v-btn>
                                            </v-form>
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
    import sha512 from 'sha512'

    const client_id = 'dd8b5386683d47cc9d955a00c1a9c3f8';
    let redirect_uri = '';
    const scope = 'user-read-private user-read-email user-library-read user-library-modify playlist-read-private streaming app-remote-control user-modify-playback-state user-read-currently-playing user-read-playback-state playlist-modify-public playlist-modify-private';

    export default {
        name: "Start",
        data: () => ({
            partyName: null,
            partyAdminPassword: null,
            disableTextInput: false,
            isLoadingButton: false,
            rules: {
                required: value => !!value || 'Required.',
            }
        }),
        mounted() {
            session.clear()
            redirect_uri = this.$socketPath + '/party/auth-callback'
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
            validateCode(event) {
                event.preventDefault()
                let context = this
                context.setLoading()
                axios
                    .post('/party/new-party', {
                        name: context.partyName,
                        password: sha512(context.partyAdminPassword).toString('hex')
                    })
                    .then(function (response) {
                        let d = response.data
                        session.clear()
                        session.setItem('partyID', d.id)
                        session.setItem('uuid', d.uuid)
                        session.setItem('partyCode', d.code)
                        session.setItem('partyName', d.name)
                        session.setItem('admin', 'true')
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
