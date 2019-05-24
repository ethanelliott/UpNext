<template>
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
                        <p class="my-2 subheading">ADMIN LOGIN</p>
                        <span class="my-5">&nbsp;</span>
                        <v-flex xs12>
                            <v-text-field box label="username" single-line v-model="username"></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                            <v-text-field box label="password" single-line type="password"
                                          v-model="password"></v-text-field>
                        </v-flex>
                        <v-btn @click="login" block class="" color="primary" dark large>
                            Login
                        </v-btn>
                    </v-flex>
                </v-flex>
            </v-layout>
        </v-container>
    </v-content>
</template>

<script>
    import session from 'localStorage'
    import sha512 from 'sha512'

    export default {
        name: "AdminLogin",
        data: () => ({
            username: '',
            password: ''
        }),
        mounted() {

        },
        methods: {
            login() {
                if (this.username === 'ethan' && sha512(this.password).toString('hex') === '35da0078d3198d3b774b87c9a28b99b76c4f59ff9a5dc400f1aa9cdcd24d2291913c308532926088292e436779b0583c6cd39011b26d307df2ca2f884856c38f') {
                    session.setItem('adminState', sha512(this.username).toString('hex'))
                    this.$router.push('/a/home')
                }
            }
        }
    }
</script>

<style>

</style>
