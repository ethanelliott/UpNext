<template>
    <v-app dark>
        <v-dialog dark v-model="installDialog" width="500">
            <v-card>
                <v-card-actions>
                    <v-btn @click.prevent="install" color="primary" flat>
                        INSTALL THE APP
                    </v-btn>
                </v-card-actions>
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
    import session from 'localStorage'

    export default {
        name: "LandingPage",
        data: () => ({
            installDialog: false,
            deferredPrompt: null
        }),
        methods: {
            install() {
                let t = this
                t.installDialog = false
                t.deferredPrompt.prompt()
                t.deferredPrompt.userChoice
                    .then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the A2HS prompt');
                        } else {
                            console.log('User dismissed the A2HS prompt');
                        }
                        t.deferredPrompt = null;
                    });
            }
        },

        mounted() {
            let t = this
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault()
                t.deferredPrompt = e
                t.installDialog = true
            });
            if (session.getItem('partyID')) {
                this.$router.push('/m/home')
            }
        }
    }
</script>
