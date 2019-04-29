<template>
    <v-app dark>
        <v-content>
            <v-container fill-height fluid>
                <v-layout align-center justify-center>
                    <v-flex lg8 md10 sm10 xl4 xs12>
                        <v-flex class="text-xs-center">
                            <v-icon color="primary" size="120">music_note</v-icon>
                            <p class="display-2 text-uppercase mb-5">
                                <span class="font-weight-bold">Up</span>
                                <span class="font-weight-light">Next</span>
                            </p>
                            <p class="my-2 subheading">Start the party!</p>
                            <span class="my-5">&nbsp;</span>
                            <v-form @submit="validateCode" ref="form" v-model="startFormValid">
                                <v-text-field :disabled="disableTextInput" :rules="[rules.required, rules.limit]"
                                              @input="checkFormValid" box
                                              full-width
                                              label="Party Name" v-model="partyName"></v-text-field>
                                <v-text-field :disabled="disableTextInput" :rules="[rules.required]"
                                              @input="checkFormValid" box
                                              full-width
                                              label="Admin Password" v-model="partyAdminPassword"></v-text-field>
                                <v-btn :disabled="!isFormValid" :loading="isLoadingButton" @click="validateCode" block
                                       color="primary" dark
                                       large type="submit">
                                    Create
                                </v-btn>
                            </v-form>
                        </v-flex>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import axios from 'axios'
    // import session from 'sessionstorage'
    import session from 'localStorage'
    import querystring from 'querystring'
    import sha512 from 'sha512'

    const client_id = 'dd8b5386683d47cc9d955a00c1a9c3f8';
    let redirect_uri = '';
    const scope = 'user-read-private user-read-email user-library-read user-library-modify playlist-read-private streaming app-remote-control user-modify-playback-state user-read-currently-playing user-read-playback-state playlist-modify-public playlist-modify-private';

    export default {
        name: "Start",
        data: () => ({
            startFormValid: null,
            isFormValid: false,
            partyName: null,
            partyAdminPassword: null,
            disableTextInput: false,
            isLoadingButton: false,
            rules: {
                required: value => !!value || 'Required',
                limit: value => (value ? value.length : 0) <= 12 || 'Party name less than 12 chars'
            }
        }),
        mounted() {
            if (session.getItem('partyID')) {
                this.$router.push('/m/home')
            } else {
                session.clear()
                redirect_uri = this.$socketPath + '/party/auth-callback'
            }
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
            checkFormValid() {
                this.isFormValid = this.$refs.form.validate()
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
