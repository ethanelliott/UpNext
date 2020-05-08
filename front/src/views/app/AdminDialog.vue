<template>
    <v-bottom-sheet inset overlay-opacity="0.9" v-model="dialog">
        <template v-slot:activator="{}">
            <v-btn @click="open" color="primary" icon>
                <v-icon>mdi-cog</v-icon>
            </v-btn>
        </template>
        <v-sheet color="darker">
            <v-card color="transparent" flat>
                <v-container class="ma-0 pa-0" fluid>
                    <v-row align="center" class="ma-0 pa-0" justify="center">
                        <v-col align="center" class="ma-0 pa-0" justify="center">
                            <v-btn @click="showMediaControls" block height="80" text tile x-large>
                                <v-icon x-large>mdi-music</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col align="center" class="ma-0 pa-0" justify="center">
                            <v-btn @click="togglePlayback" block height="80" text tile x-large>
                                <v-icon x-large>mdi-play-pause</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col align="center" class="ma-0 pa-0" justify="center">
                            <v-btn @click="skipNextSong" block height="80" text tile x-large>
                                <v-icon x-large>mdi-skip-next</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-divider/>
            <v-list color="transparent" flat subheader two-line>
                <v-subheader>Your Account</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="leaveParty" color="purple">Logout</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-divider/>
            <v-list color="transparent" flat subheader two-line>
                <v-subheader>Playlist Settings</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="cleanTheQueue" color="green">Clean the Queue</v-btn>
                            Remove all songs with a negative score
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-divider/>
            <v-list color="transparent" flat subheader two-line>
                <v-subheader>Danger Zone</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="emptyTheQueue" color="orange">Empty the Queue</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="deleteSafetyDialog=true" color="red">Delete the Party</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-dialog dark v-model="deleteSafetyDialog" width="500">
                <v-card>
                    <v-card-title>
                        Delete the party!
                    </v-card-title>
                    <v-card-text>
                        <span class="font-weight-bold">Are you sure you want to Delete the party?</span><br><br>
                        This cannot be un-done... once it's gone, it's gone for good!
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer/>
                        <v-btn @click="deleteTheParty" color="error" large>
                            Delete
                        </v-btn>
                        <v-btn @click="deleteSafetyDialog=false" color="primary" large>
                            Cancel
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-sheet>
    </v-bottom-sheet>
</template>

<script>

    export default {
        name: "app-admin-dialog",
        data: () => ({
            dialog: false,
            deleteSafetyDialog: false,
        }),
        methods: {
            showMediaControls() {
                this.$emit('media', null)
            },
            emitEvent(eventName, data) {
                this.$emit('event', {eventName, data})
            },
            skipNextSong() {
                this.emitEvent('party-playback-next', {});
            },
            togglePlayback() {
                this.emitEvent('party-playback-toggle', {});
            },
            deleteTheParty() {
                this.emitEvent('party-delete', {});
            },
            emptyTheQueue() {
                this.emitEvent('playlist-clear', {});
            },
            cleanTheQueue() {
                this.emitEvent('playlist-clean', {});
            },
            leaveParty() {
                this.$emit('leave');
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