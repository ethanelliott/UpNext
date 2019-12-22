<template>
    <v-container class="fill-height ma-0 pa-0">
        <v-dialog dark v-model="safetyDialog" width="500">
            <v-card>
                <v-card-title>
                    Are you sure you want to leave?
                </v-card-title>
                <v-card-text>
                    If you leave the party, you will have to sign-in again!
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn large @click="navigateAway">
                        Leave
                    </v-btn>
                    <v-btn color="primary" large @click="safetyDialog=false">
                        Stay
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-container class="ma-0 pa-0">
            <v-row class="ma-0 pa-0">
                <v-col class="ma-0 pa-0" align="center" justify="center">
                    <v-card color="transparent" flat max-width="600">
                        <v-img class="mx-5" :src="albumArtwork" max-width="600" min-height="300"/>
                        <v-card-text class="mx-5" align="start">
                            <span class="headline font-weight-medium text--primary">{{trackName}}</span>
                            <br>
                            <span class="font-weight-thin font-italic text--primary">{{trackArtist}}</span>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container class="ma-0 pa-0 mb-12">
            <v-row class="ma-0 pa-0">
                <v-col class="ma-0 pa-0" align="center" justify="center">
                    <v-card color="transparent" flat max-width="600">
                        <v-container>
                            <v-row align-content="space-around" justify="space-around">
                                <queue v-model="dialogs.queue"/>
                                <add v-model="dialogs.add"/>
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-footer dark fixed>
            <v-container align="center" justify="center">
                <v-row align="center" justify="center">
                    <v-progress-linear class="my-0" color="primary" height="10"/>
                </v-row>
            </v-container>
        </v-footer>
    </v-container>
</template>

<script>
    import session from 'localStorage'
    import Queue from './DialogQueue'
    import Add from './DialogAdd'

    export default {
        name: "Home",
        data: () => ({
            albumArtwork: 'https://i.scdn.co/image/ab67616d0000b2737184d97b0e3c5e673348a239',
            trackName: 'TEST',
            trackArtist: 'TEST',
            dialogs: {
                queue: false,
                add: false
            },
            safetyDialog: false,
            safeToLeave: false
        }),
        components: {
            'queue': Queue,
            'add': Add
        },
        methods: {
            navigateAway() {
                this.safeToLeave = true;
                this.$router.push('/leave');
            }
        },
        beforeRouteLeave (to, from, next) {
            if (this.safeToLeave) {
                next();
            } else {
                next(false);
            }
            // clever way to use dialogs to feel like navigation
            let noNav = false;
            let knownDialogs = Object.keys(this.dialogs);
            for (let i = 0; i < knownDialogs.length; i++) {
                if (this.dialogs[knownDialogs[i]]) {
                    this.dialogs[knownDialogs[i]] = false
                    noNav = noNav || true;
                } else {
                    noNav = noNav || false;
                }
            }
            // TODO: Add check before leaving the page
            if (!noNav) {
                this.safetyDialog = true;
            }
        },
    }
</script>
