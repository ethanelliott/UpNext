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
        <v-content>
            <v-navigation-drawer
                    absolute
                    color="darker"
                    dark
                    permanent
                    width="100%"
            >
                <template v-slot:prepend>
                    <v-toolbar class="elevation-0" color="transparent" fixed>
                        <app-update-box></app-update-box>
                        <v-spacer></v-spacer>
                        <app-info-box></app-info-box>
                    </v-toolbar>
                </template>
                <template v-slot:default>
                    <v-container class="fill-height ma-0 pa-0" fluid>
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <v-col @click="adminOpen" align="center" class="ma-0 pa-0" cols="12" justify="center" lg="6"
                                   md="8" sm="8">
                                <v-icon color="primary" size="120">mdi-music-note-plus</v-icon>
                                <p class="display-2 text-uppercase mb-10">
                                    <span class="font-weight-bold">Up</span>
                                    <span class="font-weight-light">Next</span>
                                </p>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>
                <template v-slot:append>
                    <v-btn block class="ma-0 elevation-0" color="primary" height="150" tile to="/join" x-large>
                        <h1 class="heading font-weight-regular">
                            Join a Party
                        </h1>
                    </v-btn>
                    <v-btn block class="ma-0 elevation-0 darken-3" color="primary" height="150" tile to="/start"
                           x-large>
                        <h1 class="heading font-weight-regular">
                            Start a Party
                        </h1>
                    </v-btn>
                </template>
            </v-navigation-drawer>
        </v-content>
    </v-app>
</template>

<script>
    import localStorage from 'localStorage'
    import AppInfoBox from "./InfoBox";
    import AppUpdateBox from "./UpdateBox";

    export default {
        name: 'LandingPage',
        components: {AppUpdateBox, AppInfoBox},
        data: () => ({
            installDialog: false,
            deferredPrompt: null,
            adminClickCount: 0
        }),
        methods: {
            install() {
                this.installDialog = false;
                this.deferredPrompt.prompt();
                this.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        // console.log('User accepted the A2HS prompt');
                    } else {
                        // console.log('User dismissed the A2HS prompt');
                    }
                    this.deferredPrompt = null;
                });
            },
            adminOpen() {
                if (this.adminClickCount === 9) {
                    this.adminClickCount = 0;
                    this.$router.push('/admin');
                } else {
                    this.adminClickCount++;
                }
            }
        },
        mounted() {
            if (localStorage.getItem('token')) {
                this.$router.push('/app/home');
            }
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.deferredPrompt = e;
                this.installDialog = true;
            });
        }
    }
</script>
