<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
                <v-icon>mdi-bell</v-icon>
            </v-btn>
        </template>
        <v-card color="darker">
            <v-toolbar>
                <v-toolbar-title>
                    <v-icon color="primary" left>mdi-update</v-icon>
                    Updates
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="mt-5">
                <v-container class="ma-0 pa-0" fluid>
                    <v-col class="ma-0 pa-0">
                        <v-row class="ma-0 pa-0">
                            <v-card :key="e.id" elevation="5" v-for="(e) in updates" width="100%">
                                <v-card-title>{{ e.title }}</v-card-title>
                                <v-card-subtitle>{{ dateFormat(e.date) }}</v-card-subtitle>
                                <v-card-text>
                                    <div class="markdown" v-html="markdown(e.message)"></div>
                                </v-card-text>
                            </v-card>
                        </v-row>
                    </v-col>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>

    import * as dayjs from 'dayjs';
    import snarkdown from 'snarkdown';
    import axios from 'axios';

    export default {
        name: "app-update-box",
        data: () => ({
            dialog: false,
            updates: []
        }),
        watch: {
            dialog(val) {
                if (val) {
                    axios.get('app/updates').then(({data}) => {
                        this.updates = data;
                    }).catch(console.error);
                }
            }
        },
        methods: {
            dateFormat(date) {
                return dayjs(date).format("MMMM D, YYYY")
            },
            markdown(data) {
                return snarkdown(data);
            }
        }
    }
</script>

<style>
    .markdown > * {
        margin-bottom: 1em;
    }
</style>