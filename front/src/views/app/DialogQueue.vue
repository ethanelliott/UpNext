<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn outlined depressed height="80" width="80" @click="open">
                <v-icon size="50">mdi-playlist-music</v-icon>
            </v-btn>
        </template>
        <v-card color="darker">
            <v-toolbar color="primary">
                <v-toolbar-title>Queue</v-toolbar-title>
                <v-spacer/>
                <!--                <v-btn @click="openPlaylist">-->
                <!--                    <v-icon>mdi-share</v-icon>-->
                <!--                </v-btn>-->
                <v-btn @click="close" dark icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-container class="ma-0 pa-0">
                <v-list class="ma-0 pa-0" three-line>
                    <template v-for="(track, index) in playlist">
                        <v-list-item v-bind:key="'item-' + index" @click="showVoteDialog(track)">
                            <v-list-item-avatar tile size="60">
                                <v-img :src="track.albumArtwork"/>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-bold">{{track.name}}</v-list-item-title>
                                <v-list-item-subtitle>{{track.artist}}</v-list-item-subtitle>
                                <v-list-item-subtitle>Added By: {{track.addedBy}}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <span class="overline green--text">+{{track.UpVotes}}</span>
                                <span class="title">{{ (track.UpVotes - track.DownVotes) }}</span>
                                <span class="overline red--text">-{{ track.DownVotes }}</span>
                            </v-list-item-action>
                        </v-list-item>
                        <v-divider :key="'div-' + index" v-if="index + 1 < playlist.length"/>
                    </template>
                </v-list>
            </v-container>
            <v-dialog dark overlay-opacity="0.9" transition="fab-transition" v-model="voteDialog" width="400">
                <v-card class="ma-0 pa-0" height="100" tile>
                    <v-container class="ma-0 pa-0">
                        <v-row class="ma-0 pa-0">
                            <v-col class="ma-0 pa-0" cols="6">
                                <v-btn @click="downvoteSong" block class="display-1 font-weight-thin" color="error"
                                       height="100" tile>
                                    <v-icon class="mr-2" left x-large>mdi-arrow-down</v-icon>
                                    Dislike
                                </v-btn>
                            </v-col>
                            <v-col class="ma-0 pa-0" cols="6">
                                <v-btn @click="upvoteSong" block class="display-1 font-weight-thin" color="primary"
                                       height="100" tile>
                                    Like
                                    <v-icon class="ml-2" right x-large>mdi-arrow-up</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-dialog>
        </v-card>
    </v-dialog>
</template>

<script>
    import io from 'socket.io-client'

    export default {
        props: ['playlist', 'playlistId'],
        name: "Queue",
        data: () => ({
            dialog: false,
            voteDialog: false,
            voteSongId: ''
        }),
        methods: {
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
            openPlaylist() {
                window.open(`https://open.spotify.com/playlist/${this.playlistId}`);
            },
            showVoteDialog(song) {
                this.voteDialog = true;
                this.voteSongId = song.id;
            },
            downvoteSong() {
                this.$emit('downvote', this.voteSongId);
                this.voteDialog = false;
            },
            upvoteSong() {
                this.$emit('upvote', this.voteSongId)
                this.voteDialog = false;
            },
            handleDialog(state) {
                this.$emit('dialog', state)
            }
        }

    }
</script>
