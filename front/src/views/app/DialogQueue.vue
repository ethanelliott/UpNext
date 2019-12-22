<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn outlined depressed height="80" width="80" @click="open">
                <v-icon size="50">mdi-playlist-music</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-toolbar color="darker">
                <v-btn @click="close" dark icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Queue</v-toolbar-title>
            </v-toolbar>
            <!-- Need to figure out if its a good idea to have an add button here -->
            <v-btn class="mb-2 mr-2" color="primary" dark x-large fixed bottom right fab>
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'

    export default {
        props: ['value'],
        name: "Queue",
        data: () => ({
        }),
        computed: {
            dialog: {
                get () {
                    return this.value
                },
                set (value) {
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
