<template>
    <v-app>
        <v-content>
            <v-dialog persistent v-model="dialog" width="450">
                <v-card color="darker">
                    <v-toolbar dark>
                        <v-toolbar-title>Already partying!</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-text class="mt-6" v-if="alreadyJoined">
                        Looks like you are already a part of a party! <br><br>
                        Party: {{ alreadyJoined.name }}<br>
                        Code: {{ alreadyJoined.code }}<br>
                        Your name: {{ alreadyJoined.nickName }}<br>
                        <br>
                        If you want to hop back in, just click on the "Get Back to the Party" button.<br><br>
                        <v-btn @click="getBackToTheParty" block color="primary">Get Back to the Party</v-btn>
                        <br>
                        If you want to join a new party, click on "I understand" and join a party as normal...
                        but be aware that you and your songs in your current party's queue will be deleted!
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="dialog = false" block>I Understand</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-navigation-drawer
                    absolute
                    color="darker"
                    dark
                    permanent
                    width="100%"
            >
                <template v-slot:prepend>
                    <v-toolbar class="elevation-0" color="transparent" fixed>
                        <v-btn icon to="/" x-large>
                            <v-icon>mdi-arrow-left</v-icon>
                        </v-btn>
                        <v-spacer></v-spacer>
                        <app-qr-scanner v-on:code="codeScan"></app-qr-scanner>
                    </v-toolbar>
                </template>
                <template v-slot:default>
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
                            </v-col>
                        </v-row>
                    </v-container>
                </template>
                <template v-slot:append>
                    <v-form @submit.prevent="null" autocomplete="off" ref="form" v-model="valid">
                        <v-container class="ma-0 pa-0" fluid>
                            <v-col class="ma-0 pa-0" cols="12">
                                <v-row align="center" class="ma-0 pa-0 px-3" justify="center">
                                    <v-col class="ma-0 pa-0" cols="12" lg="4">
                                        <v-row align="center" class="ma-0 pa-0" justify="center">
                                            <v-text-field :disabled="disableTextInput"
                                                          :rules="[rules.required, rules.counter]"
                                                          @input="formatForm"
                                                          aria-autocomplete="none" autofocus class="ma-0"
                                                          hint="" label="Party Code"
                                                          maxlength="4" outlined v-model="partyCode"/>
                                        </v-row>
                                    </v-col>
                                </v-row>
                                <v-row align="center" class="ma-0 pa-0 px-3" justify="center">
                                    <v-col class="ma-0 pa-0" cols="12" lg="4">
                                        <v-row align="center" class="ma-0 pa-0" justify="center">
                                            <v-text-field :disabled="disableTextInput"
                                                          :rules="[rules.required, rules.nick]"
                                                          @input="formatForm"
                                                          aria-autocomplete="none" class="ma-0" hint=""
                                                          label="Nickname" outlined v-model="nickname"/>
                                        </v-row>
                                    </v-col>
                                </v-row>
                                <v-row class="ma-0 pa-0 ma-0">
                                    <v-btn :disabled="!isFormValid" :loading="isLoadingButton"
                                           @click="joinParty"
                                           block class="ma-0 pa-0 elevation-0" color="primary" height="100" tile
                                           x-large>
                                        Join
                                    </v-btn>
                                </v-row>
                            </v-col>
                        </v-container>
                    </v-form>
                </template>
            </v-navigation-drawer>
        </v-content>
    </v-app>
</template>

<script>
    import axios from 'axios'
    import AppQrScanner from "./QRScanner";

    export default {
        name: 'JoinPage',
        components: {AppQrScanner},
        props: ['code'],
        data: () => ({
            error: false,
            valid: null,
            partyCode: '',
            nickname: '',
            rules: {
                required: value => !!value || 'Required.',
                counter: value => value.length === 4 || 'code is 4 characters',
                nick: value => value.length <= 16 || 'nickname must be less than 16 chars'
            },
            isFormValid: false,
            disableTextInput: false,
            isLoadingButton: false,
            dialog: false,
            alreadyJoined: null
        }),
        mounted() {
            this.partyCode = (this.code ? this.code : '')
            axios.post('/auth/exists', {trackingId: localStorage.getItem('trackingId')}).then(res => {
                if (res.data.exists) {
                    this.dialog = true;
                    this.alreadyJoined = res.data;
                }
            }).catch(console.error);
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
            codeScan(code) {
                this.partyCode = code.toUpperCase();
            },
            joinParty() {
                this.error = false;
                this.setLoading();
                axios.post('/party/validate', {
                    code: this.partyCode,
                    name: this.nickname,
                    trackingId: localStorage.getItem('trackingId')
                }).then(res => {
                    if (res.data.valid) {
                        this.$router.push(`/make/${res.data.token}`)
                    } else {
                        this.setNotLoading();
                        this.error = true;
                    }
                }).catch(err => {
                    console.log(err);
                });
            },
            getBackToTheParty() {
                this.error = false;
                this.setLoading();
                axios.post('/party/rejoin', {trackingId: localStorage.getItem('trackingId')}).then(res => {
                    if (res.data.valid) {
                        this.$router.push(`/make/${res.data.token}`)
                    } else {
                        this.setNotLoading();
                        this.error = true;
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
        }
    }
</script>
