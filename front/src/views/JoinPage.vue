<template>
    <v-app>
        <v-app-bar color="transparent" flat>
            <v-btn icon to="/" x-large>
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
        </v-app-bar>
        <v-content>
            <v-container class="fill-height">
                <v-container>
                    <v-row align="center" justify="center">
                        <v-col align="center" cols="12" justify="center" md="4" sm="2">
                            <v-icon color="primary" size="120">mdi-music-note-plus</v-icon>
                            <p class="display-2 text-uppercase mb-10">
                                <span class="font-weight-bold">Up</span>
                                <span class="font-weight-light">Next</span>
                            </p>
                            <p class="my-10 subheading">Join a party!</p>
                            <p class="mb-4 subheading error--text" v-if="error">Invalid Party Code!</p>
                            <v-form @submit.prevent="null" ref="form" v-model="valid">
                                <v-text-field :disabled="disableTextInput" :rules="[rules.required, rules.counter]"
                                              @input="formatForm" filled hint="" label="Party Code" v-model="partyCode"/>
                                <v-text-field :disabled="disableTextInput" :rules="[rules.required, rules.nick]"
                                              @input="formatForm" filled hint="" label="Nickname" v-model="nickname"/>
                                <v-btn :disabled="!isFormValid" :loading="isLoadingButton" @click="joinParty" block
                                       color="primary" x-large>
                                    Join
                                </v-btn>
                            </v-form>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>
        </v-content>
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
