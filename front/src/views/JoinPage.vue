<template>
    <v-app>
        <v-toolbar class="elevation-0" color="transparent">
            <v-btn icon to="/" x-large>
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
        </v-toolbar>
        <v-content>
            <v-container class="fill-height ma-0 pa-0" fluid>
                <v-row align="center" class="ma-0 pa-0" justify="center">
                    <v-col align="center" class="ma-0 pa-0" cols="12" justify="center" lg="6" md="8" sm="8">
                        <v-icon color="primary" size="120">mdi-music-note-plus</v-icon>
                        <p class="display-2 text-uppercase mb-10">
                            <span class="font-weight-bold">Up</span>
                            <span class="font-weight-light">Next</span>
                        </p>
                        <p class="my-10 subheading">Join a party!</p>
                        <p class="mb-4 subheading error--text" v-if="error">Invalid Party Code!</p>
                        <v-form @submit.prevent="null" ref="form" v-model="valid">
                            <v-container class="ma-0 pa-0" fluid>
                                <v-col class="ma-0 pa-0" cols="12">
                                    <v-row class="ma-0 pa-0 px-3">
                                        <v-text-field :disabled="disableTextInput"
                                                      :rules="[rules.required, rules.counter]"
                                                      @input="formatForm"
                                                      aria-autocomplete="none" autofocus class="ma-0"
                                                      hint="" label="Party Code"
                                                      maxlength="4" outlined v-model="partyCode"/>
                                    </v-row>
                                    <v-row class="ma-0 pa-0 px-3">
                                        <v-text-field :disabled="disableTextInput" :rules="[rules.required, rules.nick]"
                                                      @input="formatForm"
                                                      aria-autocomplete="none" class="ma-0" hint=""
                                                      label="Nickname" outlined v-model="nickname"/>
                                    </v-row>
                                </v-col>
                            </v-container>
                        </v-form>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
        <v-footer app class="elevation-0 ma-0 pa-0" color="transparent">
            <v-container class="ma-0 pa-0" fluid>
                <v-col class="ma-0 pa-0" cols="12">
                    <v-row class="ma-0 pa-0 ma-0">
                        <v-btn :disabled="!isFormValid" :loading="isLoadingButton"
                               @click="joinParty"
                               block class="ma-0 pa-0 elevation-0" color="primary" height="100" tile x-large>
                            Join
                        </v-btn>
                    </v-row>
                </v-col>
            </v-container>
        </v-footer>
    </v-app>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    export default {
        name: 'JoinPage',
        props: ['code'],
        data: () => ({
            error: false,
            valid: null,
            partyCode: '',
            nickname: '',
            rules: {
                required: value => !!value || 'Required.',
                counter: value => value.length === 4 || 'code is 4 characters',
                nick: value => value.length <= 14 || 'nickname must be less than 14 chars'
            },
            isFormValid: false,
            disableTextInput: false,
            isLoadingButton: false
        }),
        mounted() {
            this.partyCode = (this.code ? this.code : '')
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
            formatForm() {
                this.isFormValid = this.$refs.form.validate();
                this.partyCode = this.partyCode.toUpperCase();
            },
            joinParty() {
                let context = this;
                context.error = false;
                context.setLoading();
                axios.post('/party/validate', {code: context.partyCode, name: context.nickname}).then(res => {
                    if (res.data.valid) {
                        context.$router.push(`/make/${res.data.token}`)
                    } else {
                        context.setNotLoading();
                        context.error = true;
                    }
                }).catch(err => {
                })
            }
        }
    }
</script>
