<template>
    <v-container class="fill-height ma-0 pa-0" fluid>
        <v-row align="center" class="fill-height ma-0 pa-0" justify="center">
            <v-col class="fill-height ma-0 pa-0" cols="12" lg="8" md="10" sm="12">
                <v-row class="ma-0 pa-0">
                    <v-card elevation="0" tile width="100%">
                        <v-toolbar color="green">
                            <v-btn exact icon to="/admin/dashboard/parties">
                                <v-icon>mdi-arrow-left</v-icon>
                            </v-btn>
                            <v-toolbar-title>
                                Party: {{ partyName }}
                            </v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-toolbar-items>
                                <v-btn @click="getPartyDetails" icon>
                                    <v-icon>mdi-refresh</v-icon>
                                </v-btn>
                            </v-toolbar-items>
                            <template v-slot:extension>
                                <v-tabs background-color="transparent" color="basil" grow v-model="tab">
                                    <v-tab>Home</v-tab>
                                    <v-tab>Users</v-tab>
                                    <v-tab>Playlist</v-tab>
                                </v-tabs>
                            </template>
                        </v-toolbar>
                        <v-tabs-items v-model="tab">
                            <v-tab-item>
                                <v-card elevation="0" tile>
                                    <v-card :color="partyDarkColour" class="ma-0 pa-0" elevation="0">
                                        <v-container class="ma-0 pa-0" fluid>
                                            <v-row align="center" class="ma-0 pa-0 px-5" justify="center">
                                                <v-col cols="6">
                                                    <v-img :src="partyState.albumArtwork"></v-img>
                                                </v-col>
                                                <v-col cols="6">
                                                    <v-row>
                                                        <h1 class="headline">{{partyState.trackName}}</h1>
                                                    </v-row>
                                                    <v-row>
                                                        <h1 class="subtitle-1 font-weight-thin">
                                                            {{partyState.artistName}}</h1>
                                                    </v-row>
                                                    <v-row>
                                                        Added by: {{partyState.addedBy}}
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                            <v-row :key="`${i}${e.name}`" align="center" class="ma-0 pa-0 ml-5 mr-10"
                                                   justify="center" v-for="(e, i) in partySongAnalysis">
                                                <v-col class="ma-0 pa-0" cols="6">
                                                    <v-row class="ma-0 pa-0 text-left"
                                                           style="text-transform: capitalize;">
                                                        {{ e.name }}
                                                    </v-row>
                                                </v-col>
                                                <v-col class="ma-0 pa-0" cols="6">
                                                    <v-row class="ma-0 pa-0">
                                                        <v-progress-linear :value="e.value * 100" color="primary"
                                                                           height="20"
                                                                           v-if="e.value < 1 && e.value > 0"></v-progress-linear>
                                                        <h1 class="subtitle-1" v-else>{{e.value}}</h1>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                            <v-row :key="`${i}${e.name}`" align="center" class="ma-0 pa-0 ml-5 mr-10"
                                                   justify="center" v-for="(e, i) in partyColours">
                                                <v-col class="ma-0 pa-0" cols="6">
                                                    <v-row class="ma-0 pa-0 text-left"
                                                           style="text-transform: capitalize;">
                                                        {{ e.name }}
                                                    </v-row>
                                                </v-col>
                                                <v-col class="ma-0 pa-0" cols="6">
                                                    <v-row class="ma-0 pa-0">
                                                        <v-card :color="`#${e.value}`" class="py-4 text-center" tile
                                                                width="100%">#{{e.value}}
                                                        </v-card>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-card>
                                    <v-container class="ma-0 pa-0" fluid>
                                        <v-row class="ma-0 pa-0 ml-5 mr-10 mt-10">
                                            <v-col class="ma-0 pa-0" cols="12">
                                                <v-row class="ma-0 pa-0 mb-10">
                                                    <v-col cols="6">Send out a notification</v-col>
                                                    <v-col cols="6">
                                                        <app-admin-dashboard-parties-party-notify-dialog
                                                                @notify="notifyParty"
                                                        ></app-admin-dashboard-parties-party-notify-dialog>
                                                    </v-col>
                                                </v-row>
                                                <v-row class="ma-0 pa-0 mb-10">
                                                    <v-col cols="6">Force Everyone Refresh</v-col>
                                                    <v-col cols="6">
                                                        <v-btn @click="forceRefresh" block color="info" tile>Force
                                                            Refresh
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                                <v-row class="ma-0 pa-0 mb-10">
                                                    <v-col cols="6">Force Everyone Leave</v-col>
                                                    <v-col cols="6">
                                                        <v-btn @click="forceLeave" block color="orange" tile>Force
                                                            Leave
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                                <v-row class="ma-0 pa-0 mt-10 mb-10">
                                                    <v-col cols="6">Delete The whole party</v-col>
                                                    <v-col cols="6">
                                                        <v-btn @click="forceDelete" block color="error" tile>Delete The
                                                            Party
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-card>
                            </v-tab-item>
                            <v-tab-item>
                                <v-card elevation="0" tile>
                                    <v-simple-table dark>
                                        <template v-slot:default>
                                            <thead>
                                            <tr>
                                                <th class="text-left">Nickname</th>
                                                <th class="text-left">Score</th>
                                                <th class="text-left">Role</th>
                                                <th class="text-left" width="1em">Edit</th>
                                                <th class="text-left" width="1em">Notify</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr :key="`${index}${user.id}`" v-for="(user, index) in partyUsers">
                                                <td>{{ user.nickname }}</td>
                                                <td>{{ user.score }}</td>
                                                <td>{{ user.userPermission === 1 ? 'Admin' : 'User' }}</td>
                                                <td>
                                                    <app-admin-dashboard-parties-user-edit-dialog
                                                            :user="user"
                                                            @delete="deleteUser"
                                                            @edit="editUser"
                                                    ></app-admin-dashboard-parties-user-edit-dialog>
                                                </td>
                                                <td>
                                                    <app-admin-dashboard-parties-user-notify-dialog
                                                            :userId="user.id"
                                                            @notify="notifyUser"
                                                    ></app-admin-dashboard-parties-user-notify-dialog>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </template>
                                    </v-simple-table>
                                    <v-card-actions class="mt-10">
                                        <v-btn @click="resetUserScores" color="warning">Reset Scores</v-btn>
                                        <v-spacer></v-spacer>
                                        <v-btn @click="deleteAllUsers" color="error">Delete All</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-tab-item>
                            <v-tab-item>
                                <v-card elevation="0" tile>
                                    <v-simple-table dark>
                                        <template v-slot:default>
                                            <thead>
                                            <tr>
                                                <th class="text-left">Artwork</th>
                                                <th class="text-left">Name</th>
                                                <th class="text-left">Artist</th>
                                                <th class="text-left">Votes</th>
                                                <th class="text-left" width="1em">Delete</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr :key="`${index}${entry.name}`" v-for="(entry, index) in partyPlaylist">
                                                <td>
                                                    <v-img :src="entry.albumArtwork" max-height="50"
                                                           max-width="50"></v-img>
                                                </td>
                                                <td>{{ entry.name }}</td>
                                                <td>{{ entry.artist }}</td>
                                                <td>{{ entry.UpVotes - entry.DownVotes }}</td>
                                                <td>
                                                    <v-btn @click="deleteEntry(entry)" icon>
                                                        <v-icon>mdi-trash-can</v-icon>
                                                    </v-btn>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </template>
                                    </v-simple-table>
                                    <v-card-actions class="mt-10">
                                        <v-btn color="warning">Clean</v-btn>
                                        <v-spacer></v-spacer>
                                        <v-btn color="error">Delete All</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-tab-item>
                        </v-tabs-items>
                    </v-card>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import axios from 'axios';
    import AppAdminDashboardPartiesUserEditDialog from "./userEditDialog";
    import AppAdminDashboardPartiesUserNotifyDialog from "./userNotifyDialog";
    import AppAdminDashboardPartiesPartyNotifyDialog from "./partyNotifyDialog";

    export default {
        components: {
            AppAdminDashboardPartiesPartyNotifyDialog,
            AppAdminDashboardPartiesUserNotifyDialog, AppAdminDashboardPartiesUserEditDialog
        },
        props: ['id'],
        name: "app-admin-dashboard-parties-details",
        data: () => ({
            tab: null,
            partyData: null
        }),
        computed: {
            partyName() {
                return this.partyData ? this.partyData.party.name : '';
            },
            partyDarkColour() {
                return this.partyData ? `#${this.partyData.state.colours.darkMuted}` : 'darker'
            },
            partyColours() {
                return this.partyData ? Object.keys(this.partyData.state.colours).map(e => ({
                    name: e,
                    value: this.partyData.state.colours[e]
                })) : []
            },
            partySongAnalysis() {
                return this.partyData ? Object.keys(this.partyData.state.analysis).map(e => ({
                    name: e,
                    value: this.partyData.state.analysis[e]
                })) : []
            },
            party() {
                return this.partyData ? this.partyData.party : '';
            },
            partyState() {
                return this.partyData ? this.partyData.state : '';
            },
            partyUsers() {
                return this.partyData ? this.partyData.users : '';
            },
            partyPlaylist() {
                return this.partyData ? this.partyData.playlist : '';
            }
        },
        watch: {
            id(val) {
                console.log(val);
            }
        },
        mounted() {
            this.getPartyDetails();
        },
        methods: {
            notifyUser(data) {
                axios.post(`/admin/users/notify`, data).then(() => {
                    this.getPartyDetails();
                }).catch(console.error);
            },
            notifyParty({title, message}) {
                axios.post(`/admin/party/notify`, {partyId: this.party.id, title, message}).then(() => {
                    this.getPartyDetails();
                }).catch(console.error);
            },
            getPartyDetails() {
                axios.get(`/admin/party/${this.id}`).then(({data}) => {
                    console.log(data);
                    this.partyData = data;
                }).catch(console.error);
            },
            editUser(user) {
                axios.post(`/admin/users/update`, {user}).then(() => {
                    this.getPartyDetails();
                }).catch(console.error);
            },
            deleteUser(user) {
                axios.post(`/admin/users/delete`, {user}).then(() => {
                    this.getPartyDetails();
                }).catch(console.error);
            },
            resetUserScores() {
                axios.post(`/admin/users/reset`, {partyId: this.party.id}).then(() => {
                    this.getPartyDetails();
                }).catch(console.error);
            },
            deleteAllUsers() {
                axios.post(`/admin/users/delete/all`, {partyId: this.party.id}).then(() => {
                    this.getPartyDetails();
                }).catch(console.error);
            },
            deleteEntry(entry) {
                axios.post(`/admin/playlist/entry/delete`, {entry}).then(() => {
                    this.getPartyDetails();
                }).catch(console.error);
            },
            forceRefresh() {
                axios.post(`/admin/party/users/refresh`, {partyId: this.party.id}).then(() => {
                    this.getPartyDetails();
                }).catch(console.error);
            },
            forceLeave() {
                axios.post(`/admin/party/users/leave`, {partyId: this.party.id}).then(() => {
                    this.getPartyDetails();
                }).catch(console.error);
            },
            forceDelete() {
                axios.post(`/admin/party/delete`, {partyId: this.party.id}).then(() => {
                    this.$router.push('/admin/dashboard/parties');
                }).catch(console.error);
            }
        }
    }
</script>