<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn outlined color="primary" depressed height="80" width="80" @click="open">
                <v-icon size="50">mdi-music-note-plus</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-toolbar color="darker">
                <v-btn @click="close" dark icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Add Songs</v-toolbar-title>
            </v-toolbar>
            <v-container>
                <v-row>
                    <v-col align="center" justify="center">
                        <search/>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-card>
                            <v-card-title>
                                Recommended Songs
                            </v-card-title>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-card>
                            <v-card-title>
                                Top Playlists
                            </v-card-title>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'

    import Search from './Search'

    export default {
        props: ['value'],
        name: "Queue",
        data: () => ({}),
        components: {
            'search': Search
        },
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
            }
        },
        watch: {}

    }
</script>
