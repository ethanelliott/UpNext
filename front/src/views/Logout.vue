<template>
    <v-app color="accent" dark>
        <v-content>
            <v-container fill-height fluid>
                <v-layout align-center justify-center>
                    <v-flex lg6 md8 sm8 xs10>
                        <v-card class="elevation-12" color="secondary">
                            <v-card-text>
                                <v-container column grid-list-xl>
                                    <v-layout>
                                        <v-flex>
                                            <v-card color="secondary" flat>
                                                <v-card-text>
                                                    <p class="text-xs-center big-text text-uppercase">
                                                        <span>Up</span>
                                                        <span class="font-weight-light">Next</span>
                                                    </p>
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
    import session from 'sessionstorage'
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
                t.$router.push('/')
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
