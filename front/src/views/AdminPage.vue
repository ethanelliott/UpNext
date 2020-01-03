<template>
    <v-app>
        <v-content>
            <v-app-bar color="darker">
                <v-toolbar-title>
                    <v-icon color="primary">mdi-music-note-plus</v-icon>
                    UPNEXT Admin
                </v-toolbar-title>
                <v-spacer/>
                <v-toolbar-items>
                    <v-btn icon @click="updateData">
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </v-toolbar-items>
            </v-app-bar>
            <v-container>
                <template>
                    <v-data-table
                            :headers="headers"
                            :items="parties"
                            hide-default-footer
                            class="elevation-1"
                            :expanded.sync="expanded"
                            show-expand
                    >
                        <template v-slot:top>
                            <v-toolbar flat>
                                <v-toolbar-title>Parties</v-toolbar-title>
                                <v-spacer/>
                            </v-toolbar>
                        </template>
                        <template v-slot:expanded-item="{ headers, item }">
                            <td :colspan="headers.length">
                                <v-btn color="primary" @click="fixChrome(item.id)">
                                    Fix Chrome Error
                                </v-btn>
                                <v-btn color="warning" @click="joinAsAdmin(item.id)">
                                    Join as Admin
                                </v-btn>
                                <v-btn color="error" @click="deleteParty(item.id)">
                                    Delete Party
                                </v-btn>
                                <br>
                                <v-list two-line color="transparent">
                                    <template v-for="(user, index) in item.users">
                                        <v-list-item v-bind:key="user.id">
                                            <v-list-item-content>
                                                <v-list-item-title>{{user.name}}</v-list-item-title>
                                                <v-list-item-subtitle>{{user.id}}</v-list-item-subtitle>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <v-btn color="primary" icon large>
                                                    <v-icon>mdi-cancel</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                        <v-divider :key="'div-' + index" v-if="index + 1 < item.users.length"/>
                                    </template>
                                </v-list>
                            </td>
                        </template>
                    </v-data-table>
                </template>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    export default {
        name: 'Admin',
        data: () => ({
            expanded: [],
            headers: [
                {text: 'Name', align: 'left', value: 'name',},
                {text: 'Code', align: 'left', value: 'code',},
                {text: 'State', align: 'left', value: 'state',},
                {text: 'Song', align: 'left', value: 'playState.trackName',},
                {text: 'User Count', align: 'left', value: 'users.length',},
            ],
            parties: []
        }),
        methods: {
            updateData() {
                let t = this;
                axios.post('/party/get/all').then(res => {
                    t.parties = res.data;
                }).catch(err => {
                })
            },
            deleteParty(partyId) {
                axios.post(`/party/delete?id=${partyId}`).then(res => {
                    console.log(res.data);
                }).catch(err => {
                })
            },
            joinAsAdmin(partyId) {
                console.log(partyId);
            },
            fixChrome(partyId) {
                console.log(partyId);
            }
        },
        mounted() {
            this.updateData()
        }
    }
</script>
