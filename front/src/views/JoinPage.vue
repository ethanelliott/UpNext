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
                            <p class="my-10 subheading">Join a party!</p>
                            <v-form @submit.prevent="null" ref="form" v-model="valid">
                                <v-text-field :disabled="disableTextInput" :rules="[rules.required, rules.counter]"
                                              @input="formatForm" filled hint="" label="Party Code" v-model="code"/>
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
        data: () => ({
            valid: null,
            code: '',
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
                this.code = this.code.toUpperCase();
            },
            joinParty() {
                let context = this;
                context.setLoading();
                console.log(context.code)
                axios.post('/party/validate', {code: context.code}).then(res => {
                    console.log(res.data);
                    if (res.data.valid) {
                        context.$router.push(`/make/${res.data.token}`)
                    } else {
                        context.setNotLoading();
                    }
                }).catch(err => {
                    console.error(err);
                })
            }
        }
    }
</script>
