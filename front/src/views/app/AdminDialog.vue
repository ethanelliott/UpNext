<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn color="primary" icon v-on="on">
                <v-icon>mdi-cog</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-toolbar color="darker">
                <v-toolbar-title>
                    Admin
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card color="transparent" flat>
                <v-card-title>Media Controls</v-card-title>
                <v-container class="ma-0 pa-0">
                    <v-row align="center" class="ma-0 pa-0" justify="center">
                        <v-col class="ma-0 pa-0">
                            <v-btn @click="showMediaControls" block tile x-large>
                                <v-icon left>mdi-music</v-icon>
                                Show The Media Controls
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row align="center" class="ma-0 pa-0" justify="center">
                        <v-col align="center" class="ma-0 pa-0" justify="center">
                            <v-btn @click="togglePlayback" icon x-large>
                                <v-icon>mdi-play-pause</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col align="center" class="ma-0 pa-0" justify="center">
                            <v-btn @click="skipNextSong" icon x-large>
                                <v-icon>mdi-skip-next</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-list flat subheader two-line>
                <v-subheader>Chrome Stop Error</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="fixChromeError" color="primary">Fix the Chrome Error</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-divider/>
            <v-list flat subheader two-line>
                <v-subheader>Playback Settings</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="cleanTheQueue" color="primary">Clean the Queue</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-divider/>
            <v-list flat subheader two-line>
                <v-subheader>Danger Zone</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="emptyTheQueue" color="warning">Empty the Queue</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="deleteSafetyDialog=true" color="error">Delete the Party</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-card>
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
    </v-dialog>
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
            fixChromeError() {
                this.emitEvent('party-fix-chrome', {});
            },
            deleteTheParty() {
                this.emitEvent('party-delete', {});
            },
            emptyTheQueue() {
                this.emitEvent('playlist-clear', {});
            },
            cleanTheQueue() {
                this.emitEvent('playlist-clean', {});
            }
        }
    }
</script>