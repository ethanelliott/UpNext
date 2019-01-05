<template>
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
                                            <v-form @submit="validateCode">
                                                <v-text-field :disabled="disableTextInput" :rules="[rules.required]" box
                                                              full-width label="Admin Password" type="password"
                                                              v-model="adminPassword"></v-text-field>
                                                <v-btn @click="validateCode" block color="primary" dark large
                                                       type="submit">
                                                    <span>
                                                        Login
                                                    </span>
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
</template>

<script>
    import axios from 'axios'
    import sha512 from 'sha512'

    export default {
        name: "AdminStatsLogin",
        data: () => ({
            rules: {
                required: value => !!value || 'Required.'
            },
            snackbar: null,
            snackbarMessage: 'WRONG',
            adminPassword: '',
            disableTextInput: false
        }),
        mounted() {
        },
        methods: {
            validateCode(event) {
                event.preventDefault()
                let context = this
                axios.post('/party/auth-admin-login', {
                    password: sha512(context.adminPassword).toString('hex')
                }).then((response) => {
                    let d = response.data
                    if (d.valid) {
                        context.$router.push('/admin')
                    } else {
                        context.snackbarMessage = 'Invalid Password'
                        context.snackbar = true
                    }
                }).catch((err) => {
                    console.error(err)
                })
            }
        }
    }
</script>
