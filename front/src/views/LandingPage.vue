<template>
    <v-app dark>
        <!--        Coming Soon, dialogs for join/start-->
        <v-dialog fullscreen hide-overlay transition="scale-transition" v-model="dialog">
            <v-card>
                <v-toolbar color="#424242" flat>
                    <v-spacer></v-spacer>
                    <v-btn @click="closeDialog" dark icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-container fill-height fluid>
                    <v-layout align-center justify-center>
                        <v-flex lg8 md10 sm10 xl4 xs12>

                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card>
        </v-dialog>
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
                            <p class="my-2 subheading">Join a party, or start your own!</p>
                            <span class="my-5">&nbsp;</span>
                            <v-btn block class="my-5" color="primary" dark large to="/join">
                                Join a Party
                            </v-btn>
                            <v-btn block class="my-5" color="primary" dark large outline to="/start">
                                Start a Party
                            </v-btn>
                        </v-flex>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    // import session from 'sessionstorage'
    import session from 'localStorage'

    export default {
        name: "LandingPage",
        data: () => ({
            dialog: false
        }),
        methods: {
            closeDialog() {
                this.dialog = false
            }
        },
        mounted() {
            if (session.getItem('partyID')) {
                this.$router.push('/m/home')
            }
        }
    }
</script>
