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
                            <p class="my-2 subheading">Logging out...</p>
                        </v-flex>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    export default {
        name: "Logout",
        data: () => ({}),
        mounted() {
            let t = this
            axios.post('/party/leave', {
                id: session.getItem('partyID'),
                uuid: session.getItem('uuid'),
            }).then(function (response) {
                console.log(response)
                session.clear()
                setTimeout(() => {
                    t.$router.push('/')
                }, 700)
            }).catch(function (error) {
                console.error(error)
            })
        }
    }
</script>

<style scoped>
    .big-text {
        font-size: 3em;
    }
</style>
