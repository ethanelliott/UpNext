<template>
    <v-app>
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
                            <p class="my-10 subheading">Let's get the party started!</p>
                            <v-form @submit.prevent="null" ref="form" v-model="valid">
                                <v-text-field :disabled="disableTextInput" :rules="[rules.required, rules.limit]"
                                              @input="checkFormValid" filled hint="" label="Party Name" v-model="name"/>
                                <v-text-field :disabled="disableTextInput" :rules="[rules.required]"
                                              @input="checkFormValid" filled hint="" label="Your Nickname"
                                              v-model="nickname"/>
                                <v-btn :disabled="!isFormValid" :loading="isLoadingButton" @click="startParty" block
                                       color="primary" x-large>Start
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
                axios.post(`/auth/start?partyName=${context.name}&nickName=${context.nickname}`)
                    .then(res => {
                        window.location.href = res.data;
                    }).catch(err => {
                    console.error(err);
                })
            }
        }
    }
</script>
