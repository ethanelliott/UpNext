<template>
    <v-app>
        <v-dialog dark v-model="installDialog" width="500">
            <v-card class="pa-2">
                <v-card-title>
                    Install UpNext
                </v-card-title>
                <v-card-text>
                    <p class="my-2 subheading">Looks like you don't have UpNext installed... click the button below to
                        install it!</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn @click="installDialog = false" color="primary" flat outlined>
                        CANCEL
                    </v-btn>
                    <v-btn @click.prevent="install" color="primary" flat>
                        INSTALL THE APP
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog dark v-model="aboutDialog" width="500">
            <v-card>
                <v-container align="center" justify="center">
                    <v-row>
                        <v-col align="center" justify="center">
                            <v-icon class="mt-6" color="primary" size="120">mdi-music-note-plus</v-icon>
                            <p class="display-2 text-uppercase mb-0">
                                <span class="font-weight-bold">Up</span>
                                <span class="font-weight-light">Next</span>
                            </p>
                        </v-col>
                    </v-row>
                </v-container>
                <v-card-title>
                    Welcome to UpNext
                </v-card-title>
                <v-card-text>
                    UpNext is a party oriented, real-time, vote-based playlist generation application
                    with spotify integration.
                    <br><br>
                    It is designed to help make your next party a little easier. We take the party
                    playlist and distribute it across everyone at the party, so that everyone can get
                    the music they want.
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn @click="aboutDialog=false">
                        COOL
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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
                            <p class="my-10 subheading">Join a party, or start your own!</p>
                            <v-btn @click="aboutDialog=true" block class="my-10" color="primary" height="20px" small
                                   text>
                                What is UpNext
                                <v-icon dark right>mdi-help-box</v-icon>
                            </v-btn>
                            <v-btn block class="my-5" color="primary" height="80px" to="/join" x-large>
                                Join a Party
                            </v-btn>
                            <v-btn block color="primary" height="80px" outlined to="/start" x-large>
                                Start a Party
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'localStorage'

    export default {
        name: 'LandingPage',
        data: () => ({
            installDialog: false,
            deferredPrompt: null,
            aboutDialog: false
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
            // if (session.getItem('partyID')) {
            //     this.$router.push('/m/home')
            // }
        }
    }
</script>
