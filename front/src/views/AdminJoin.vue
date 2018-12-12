<template>
    <v-app color="accent" dark>
        <v-content>
            <v-container fill-height fluid>
                <v-layout align-center justify-center>
                    <v-flex lg6 md8 sm8 xs10>
                        <v-card class="elevation-12" color="secondary">
                            <v-card-text>
                                <v-container grid-list-xl column>
                                    <v-layout>
                                        <v-flex>
                                            <v-card flat color="secondary">
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
                                            <v-card flat color="secondary">
                                                <v-card-text>
                                                    <v-text-field label="Party Code" box full-width v-model="partyCode" :disabled="disableTextInput" :rules="[rules.required, rules.counter]"></v-text-field>
                                                    <v-text-field label="Admin Password" box full-width v-model="partyAdminPassword" :disabled="disableTextInput" :rules="[rules.required]"></v-text-field>
                                                    <v-btn block color="primary" dark large @click="validateCode" :loading="isLoadingButton">
                                                        <span>
                                                            Join
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
    import sha512 from 'sha512'

    export default {
        name: "Join",
        data: () => ({
            partyCode: '',
            partyAdminPassword: '',
            disableTextInput: false,
            isLoadingButton: false,
            rules: {
                required: value => !!value || 'Required.',
                counter: value => value.length === 4 || 'code is 4 characters'
            }
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
                    .post('/party/auth-code-admin', {
                        partyCode: context.partyCode.toUpperCase(),
                        partyPassword: sha512(context.partyAdminPassword).toString('hex')
                    })
                    .then(function(response) {
                        let d = response.data
                        if (d.valid) {
                            context.setNotLoading()
                            session.clear()
                            session.setItem('partyID', d.id)
                            session.setItem('admin', 'true')
                            session.setItem('partyCode', context.partyCode.toUpperCase())
                            session.setItem('partyName', d.name)
                            context.$router.push('/main/home')
                        } else {
                            context.setNotLoading()
                        }
                    })
                    .catch(function(err) {
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
