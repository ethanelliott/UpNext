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
                                                    <p class="text-xs-center ">
                                                        SUDO LOGIN
                                                    </p>
                                                </v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout>
                                        <v-flex>
                                            <v-card color="secondary" flat>
                                                <v-card-text>
                                                    <v-form @submit="sudoLogin">
                                                        <v-text-field :disabled="disableTextInput" box full-width
                                                                      label="Sudo Password" type="password"
                                                                      v-model="sudopass"></v-text-field>
                                                        <v-btn :loading="isLoadingButton" @click="sudoLogin" block
                                                               color="primary" dark large type="submit">
                                                            <span>Login</span>
                                                        </v-btn>
                                                    </v-form>
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
        <v-snackbar :timeout="5000" bottom color="secondary" v-model="snackbar">
            {{ snackbarMessage }}
            <v-btn @click="snackbar = false" color="primary" dark flat>
                Close
            </v-btn>
        </v-snackbar>
    </v-app>
</template>

<script>
    import axios from 'axios'
    import session from 'sessionstorage'
    import sha512 from 'sha512'

    export default {
        name: "SudoLogin",
        data: () => ({
            snackbar: null,
            snackbarMessage: 'Hello',
            sudopass: '',
            isLoadingButton: false,
            disableTextInput: false
        }),
        methods: {
            setLoading() {
                this.isLoadingButton = true
                this.disableTextInput = true
            },
            setNotLoading() {
                this.isLoadingButton = false
                this.disableTextInput = false
            },
            sudoLogin(event) {
                event.preventDefault()
                let context = this
                context.setLoading()
                console.log(context.sudopass)
                axios
                    .post('/admin/sudo/login', {
                        sudopass: sha512(context.sudopass).toString('hex'),
                    })
                    .then(function (response) {
                        let d = response.data
                        if (d.valid) {
                            context.setNotLoading()
                            session.clear()
                            context.$router.push('/sudo-main')
                        } else {
                            context.sudopass = ''
                            context.setNotLoading()
                            context.snackbarMessage = 'Invalid Sudo Password!'
                            context.snackbar = true
                        }
                    })
                    .catch(function (err) {
                        console.error(err)
                    })
            }
        },
        mounted() {

        }
    }
</script>

<style scoped>
    .big-text {
        font-size: 3em;
    }
</style>
