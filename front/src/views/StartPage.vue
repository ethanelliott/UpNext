<template>
    <v-app>
        <v-content>
            <v-navigation-drawer
                    absolute
                    color="darker"
                    dark
                    permanent
                    width="100%"
            >
                <template v-slot:prepend>
                    <v-toolbar color="transparent" flat>
                        <v-btn icon to="/" x-large>
                            <v-icon>mdi-arrow-left</v-icon>
                        </v-btn>
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
                                <p class="my-10 subheading">Let's get the party started!</p>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>
                <template v-slot:append>
                    <v-form @submit.prevent="null" ref="form" v-model="valid">
                        <v-container class="ma-0 pa-0" fluid>
                            <v-col class="ma-0 pa-0" cols="12">
                                <v-row align="center" class="ma-0 pa-0 px-3" justify="center">
                                    <v-col class="ma-0 pa-0" cols="12" lg="4">
                                        <v-row align="center" class="ma-0 pa-0" justify="center">
                                            <v-text-field :disabled="disableTextInput"
                                                          :rules="[rules.required, rules.limit]"
                                                          @input="checkFormValid" aria-autocomplete="none" hint=""
                                                          label="Party Name" outlined v-model="name"/>
                                        </v-row>
                                    </v-col>
                                </v-row>
                                <v-row align="center" class="ma-0 pa-0 px-3" justify="center">
                                    <v-col class="ma-0 pa-0" cols="12" lg="4">
                                        <v-row align="center" class="ma-0 pa-0" justify="center">
                                            <v-text-field :disabled="disableTextInput" :rules="[rules.required]"
                                                          @input="checkFormValid" aria-autocomplete="none" hint=""
                                                          label="Your Nickname" outlined
                                                          v-model="nickname"/>
                                        </v-row>
                                    </v-col>
                                </v-row>
                                <v-row class="ma-0 pa-0 ma-0">
                                    <v-btn :disabled="!isFormValid" :loading="isLoadingButton" @click="startParty" block
                                           color="primary" height="100" x-large>Start
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
    import session from 'localStorage'
    import axios from 'axios'

    export default {
        name: 'StartPage',
        data: () => ({
            valid: null,
            name: '',
            nickname: '',
            rules: {
                required: value => !!value || 'Required',
                limit: value => (value ? value.length : 0) <= 12 || 'Party name less than 12 chars'
            },
            isFormValid: false,
            disableTextInput: false,
            isLoadingButton: false
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
            checkFormValid() {
                this.isFormValid = this.$refs.form.validate()
            },
            startParty() {
                let context = this
                context.setLoading()
                axios
                    .post(`/auth/start?partyName=${context.name}&nickName=${context.nickname}&trackingId=${localStorage.getItem('trackingId')}`).then(res => {
                    window.location.href = res.data;
                })
            }
        }
    }
</script>
