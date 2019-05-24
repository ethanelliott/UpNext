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
                            <p class="my-2 subheading">Join the party!</p>
                            <span class="my-5">&nbsp;</span>
                            <v-form @submit="validateCode" ref="form" v-model="valid">
                                <v-text-field :disabled="disableTextInput" :rules="[rules.required, rules.counter]"
                                              @input="checkFormValid" box
                                              full-width
                                              label="Party Code"
                                              v-model="partyCode"></v-text-field>
                                <v-text-field :disabled="disableTextInput" :rules="[rules.required, rules.nick]"
                                              @input="checkFormValid" box
                                              full-width
                                              label="Nickname"
                                              v-model="nickName"></v-text-field>
                                <v-btn :disabled="!isFormValid" :loading="isLoadingButton" @click="validateCode" block
                                       color="primary" dark large
                                       type="submit">
                                    Join
                                </v-btn>
                            </v-form>
                        </v-flex>
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
    import session from 'localStorage'

    export default {
        name: "Join",
        props: ['code'],
        data: () => ({
            valid: null,
            isFormValid: false,
            partyCode: '',
            nickName: '',
            snackbar: null,
            snackbarMessage: 'Hello',
            disableTextInput: false,
            isLoadingButton: false,
            rules: {
                required: value => !!value || 'Required.',
                counter: value => value.length === 4 || 'code is 4 characters',
                nick: value => value.length <= 10 || 'nickname must be less than 10 chars'
            }
        }),
        mounted() {
            this.partyCode = (this.code ? this.code : '')
            if (session.getItem('partyID')) {
                this.$router.push('/m/home')
            } else {
                session.clear()
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
                this.partyCode = this.partyCode.toUpperCase()
            },
            validateCode(event) {
                event.preventDefault()
                let c = this
                if (c.$refs.form.validate()) {
                    c.setLoading()
                    axios
                        .post('/party/auth-code', {
                            partyCode: c.partyCode.toUpperCase(),
                            nickName: c.nickName
                        })
                        .then(function (response) {
                            let d = response.data
                            if (d.valid) {
                                c.setNotLoading()
                                session.clear()
                                session.setItem('partyID', d.id)
                                session.setItem('uuid', d.uuid)
                                session.setItem('admin', 'false')
                                session.setItem('partyCode', c.partyCode.toUpperCase())
                                session.setItem('partyName', d.name)
                                c.$router.push('/m')
                            } else {
                                c.setNotLoading()
                                c.snackbarMessage = 'Invalid Party Code'
                                c.snackbar = true
                            }
                        })
                        .catch(function (err) {
                            console.error(err)
                        })
                }
            }
        }
    }
</script>
