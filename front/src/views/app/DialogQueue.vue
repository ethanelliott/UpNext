<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn outlined depressed height="80" width="80" @click="open">
                <v-icon size="50">mdi-playlist-music</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-dialog dark v-model="voteDialog" width="500">
                <v-card>
                    <v-card-actions>
                        <v-btn @click="downvoteSong" color="primary" text>
                            <v-icon>mdi-arrow-down</v-icon>
                            Downvote
                        </v-btn>
                        <v-spacer/>
                        <v-btn @click="upvoteSong" color="primary" text>
                            Upvote
                            <v-icon>mdi-arrow-up</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-app-bar fixed color="darker">
                <v-btn @click="close" dark icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Queue</v-toolbar-title>
                <v-spacer/>
                <v-btn @click="openPlaylist">
                    <v-icon>mdi-share</v-icon>
                </v-btn>
            </v-app-bar>
            <v-container>
                <v-list class="mt-10" three-line>
                    <template v-for="(track, index) in playlist">
                        <v-list-item v-bind:key="'item-' + index" @click="showVoteDialog(track)">
                            <v-list-item-avatar tile size="60">
                                <v-img :src="track.albumArtwork"/>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-bold">{{track.name}}</v-list-item-title>
                                <v-list-item-subtitle>{{track.artist}}</v-list-item-subtitle>
                                <v-list-item-subtitle>Added By: {{track.added.name}}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <span class="overline green--text">+{{track.upVoters.length}}</span>
                                <span class="title">{{track.votes}}</span>
                                <span class="overline red--text">-{{track.downVoters.length}}</span>
                            </v-list-item-action>
                        </v-list-item>
                        <v-divider :key="'div-' + index" v-if="index + 1 < playlist.length"/>
                    </template>
                </v-list>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'
    import io from 'socket.io-client'

    export default {
        props: ['value', 'playlist', 'playlistId'],
        name: "Queue",
        data: () => ({
            voteDialog: false,
            voteSongId: ''
        }),
        computed: {
            dialog: {
                get() {
                    return this.value
                },
                set(value) {
                    this.$emit('input', value)
                }
            }
        },
        methods: {
            open() {
                this.dialog = true;
            },
            close() {
                this.dialog = false;
            },
            openPlaylist() {
                window.open(`spotify:playlist:${this.playlistId}`, '_blank');
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
            }
        }

    }
</script>
