<template>
    <v-dialog persistent transition="dialog-bottom-transition" v-model="dialog" width="500">
        <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </template>
        <v-card color="darker">
            <v-toolbar>
                <v-toolbar-title>
                    New Update
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="close" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="text-center pa-6 pb-0">
                <v-text-field
                        label="Title"
                        outlined
                        v-model="title"
                ></v-text-field>
                <v-menu
                        :close-on-content-click="false"
                        :return-value.sync="date"
                        min-width="290px"
                        ref="menu"
                        transition="scale-transition"
                        v-model="menu"
                >
                    <template v-slot:activator="{ on }">
                        <v-text-field
                                label="Date of Posting"
                                outlined
                                readonly
                                v-model="date"
                                v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker no-title scrollable v-model="date">
                        <v-spacer></v-spacer>
                        <v-btn @click="menu = false" text>Cancel</v-btn>
                        <v-btn @click="$refs.menu.save(date)" color="primary" text>OK</v-btn>
                    </v-date-picker>
                </v-menu>
                <v-tabs background-color="transparent" grow v-model="tab">
                    <v-tab>Edit</v-tab>
                    <v-tab>Preview</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab">
                    <v-tab-item>
                        <v-textarea
                                label="Message (markdown)"
                                outlined
                                single-line
                                v-model="message"
                        ></v-textarea>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card class="pa-6 text-left">
                            <div v-html="preview"></div>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="close" text>Cancel</v-btn>
                <v-btn @click="saveUpdate" color="primary">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import * as dayjs from 'dayjs';
    import snarkdown from 'snarkdown';

    export default {
        props: ['userId'],
        name: "app-admin-dashboard-updates-new-dialog",
        data: () => ({
            dialog: false,
            tab: null,
            date: dayjs().format('YYYY-MM-DD'),
            menu: false,
            title: '',
            message: '',
            preview: ''
        }),
        watch: {
            dialog(val) {
                if (val) {
                    this.title = '';
                    this.message = '';
                    this.preview = '';
                }
            },
            tab(val) {
                if (val === 1) {
                    this.preview = snarkdown(this.message);
                }
            }
        },
        methods: {
            close() {
                this.dialog = false;
            },
            saveUpdate() {
                this.$emit('save', {
                    title: this.title,
                    message: this.message,
                    date: dayjs(this.date).valueOf()
                });
                this.dialog = false;
            }
        }
    }
</script>