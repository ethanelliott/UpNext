<template>
    <v-dialog persistent transition="dialog-bottom-transition" v-model="dialog" width="500">
        <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
                <v-icon>mdi-cog</v-icon>
            </v-btn>
        </template>
        <v-card color="darker">
            <v-toolbar>
                <v-toolbar-title>
                    Edit User
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="close" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="text-center pa-6">
                <v-text-field
                        label="Nickname"
                        outlined
                        v-model="nickname"
                ></v-text-field>
                <v-text-field
                        label="Score"
                        outlined
                        type="number"
                        v-model="score"
                ></v-text-field>
                <v-select
                        :items="roles"
                        label="Permissions"
                        outlined
                        v-model="role"
                ></v-select>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="deleteUser" icon>
                    <v-icon>mdi-trash-can</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="close" text>
                    Cancel
                </v-btn>
                <v-btn @click="save" color="green">
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import axios from 'axios';

    export default {
        props: ['user'],
        name: "app-admin-dashboard-parties-user-edit-dialog",
        data: () => ({
            dialog: false,
            nickname: '',
            score: 0,
            role: 0,
            roles: [{
                text: "User",
                value: 0
            }, {
                text: "Admin",
                value: 1
            }]
        }),
        watch: {
            dialog(val) {
                if (val) {
                    this.nickname = this.user.nickname;
                    this.score = this.user.score;
                    this.role = this.user.userPermission;
                }
            }
        },
        methods: {
            close() {
                this.dialog = false;
            },
            deleteUser() {
                this.$emit('delete', this.user);
                this.dialog = false;
            },
            save() {
                const userCopy = Object.assign({}, this.user);
                const update = {
                    nickname: this.nickname,
                    score: parseInt(this.score),
                    userPermission: this.role
                };
                Object.keys(update).forEach(e => {
                    userCopy[e] = update[e];
                });
                this.$emit('edit', userCopy);
                this.dialog = false;
            }
        }
    }
</script>