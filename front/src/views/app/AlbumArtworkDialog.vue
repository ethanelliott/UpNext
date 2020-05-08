<template>
    <v-dialog overlay-opacity="0.95" v-model="dialog" width="400">
        <template v-slot:activator="{}">
            <transition mode="out-in" name="change">
                <v-img :key="albumArtwork"
                       :src="albumArtwork"
                       @click="open"
                       class="mx-5 elevation-20"
                       max-width="600"
                       min-height="300"
                >
                </v-img>
            </transition>
        </template>
        <v-card>
            <v-toolbar color="darker">
                <v-toolbar-title>
                    About
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="close" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-container class="ma-0 pa-0" fluid>
                <v-col class="ma-0 pa-0">
                    <v-row :key="i" align="center" class="ma-0 pa-0 my-3 mx-3"
                           justify="center" v-for="(e, i) in songStats">
                        <v-col class="ma-0 pa-0" cols="5">
                            <v-row class="ma-0 pa-0 text-left"
                                   style="text-transform: capitalize;">
                                {{ e.name }}
                            </v-row>
                        </v-col>
                        <v-col class="ma-0 pa-0" cols="7">
                            <v-row align="center" class="ma-0 pa-0" justify="center">
                                <v-progress-linear :value="e.value * 100" color="primary"
                                                   height="20"></v-progress-linear>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row align="center" class="ma-0 pa-0 mt-5" justify="center">
                        <v-btn @click="openSpotifyUri" block color="primary" tile x-large>
                            <v-icon class="mr-5" large left>mdi-spotify</v-icon>
                            View In Spotify
                        </v-btn>
                    </v-row>
                </v-col>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>

    export default {
        props: ['albumArtwork', 'songStats', 'trackId'],
        name: "app-current-artwork-dialog",
        data: () => ({
            dialog: false,
        }),
        methods: {
            openSpotifyUri: function () {
                this.overlay = false;
                window.open(`https://open.spotify.com/track/${this.trackId}`);
            },
            handleDialog(state) {
                this.$emit('dialog', state)
            },
            open() {
                window.scrollTo(0, 0);
                this.dialog = true;
                this.handleDialog({
                    state: 'open',
                    id: 'queue',
                    close: this.close
                });
            },
            close() {
                this.dialog = false;
                this.handleDialog({
                    state: 'close',
                    id: 'queue'
                });
            },
        }
    }
</script>

<style>
    .change-enter-active,
    .change-leave-active {
        transition-duration: 0.5s;
        transition-property: opacity;
        transition-timing-function: ease;
    }

    .change-enter,
    .change-leave-active {
        opacity: 0
    }
</style>