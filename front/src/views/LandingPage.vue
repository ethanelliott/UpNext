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
                    <v-btn @click="installDialog = false" color="primary" text outlined>
                        CANCEL
                    </v-btn>
                    <v-btn @click.prevent="install" color="primary" text>
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
        <!--        <v-toolbar app class="elevation-0">-->
        <!--            <v-btn @click="aboutDialog=true" block class="my-10" color="primary" height="20px" small-->
        <!--                   text>-->
        <!--                What is UpNext-->
        <!--                <v-icon dark right>mdi-help-box</v-icon>-->
        <!--            </v-btn>-->
        <!--        </v-toolbar>-->
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
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>
        </v-content>
        <v-footer class="ma-0 pa-0" color="transparent" height="300">
            <v-btn block class="ma-0 elevation-0" color="primary" height="150" tile to="/join" x-large>
                <h1 class="heading font-weight-regular">
                    Join a Party
                </h1>
            </v-btn>
            <v-btn block class="ma-0 elevation-0 darken-3" color="primary" height="150" tile to="/start" x-large>
                <h1 class="heading font-weight-regular">
                    Start a Party
                </h1>
            </v-btn>
        </v-footer>
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
                            // console.log('User accepted the A2HS prompt');
                        } else {
                            // console.log('User dismissed the A2HS prompt');
                        }
                        t.deferredPrompt = null;
                    });
            }
        },
        mounted() {
            let t = this
            if (session.getItem('token')) {
                t.$router.push('/app/home');
            }
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
