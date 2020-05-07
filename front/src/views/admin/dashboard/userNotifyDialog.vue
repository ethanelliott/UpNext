<template>
    <v-dialog transition="dialog-bottom-transition" v-model="dialog" width="500">
        <template v-slot:activator="{ on }">
            <v-btn color="purple" icon v-on="on">
                <v-icon>mdi-bell</v-icon>
            </v-btn>
        </template>
        <v-card color="darker">
            <v-toolbar>
                <v-toolbar-title>
                    Send Notification
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="close" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="text-center pa-6">
                <v-text-field
                        label="Title"
                        outlined
                        v-model="title"
                ></v-text-field>
                <v-text-field
                        label="Message"
                        outlined
                        v-model="message"
                ></v-text-field>
                <v-btn @click="sendMessage" block color="primary">SEND</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: ['userId'],
        name: "app-admin-dashboard-parties-user-notify-dialog",
        data: () => ({
            dialog: false,
            title: '',
            message: ''
        }),
        watch: {
            dialog(val) {
                if (val) {
                    console.log(val);
                    this.title = '';
                    this.message = '';
                }
            }
        },
        methods: {
            close() {
                this.dialog = false;
            },
            sendMessage() {
                this.$emit('notify', {
                    title: this.title,
                    message: this.message,
                    userId: this.userId
                })
            }
        }
    }
</script>