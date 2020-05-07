<template>
    <v-container class="fill-height ma-0 pa-0" fluid>
        <v-row align="center" class="fill-height ma-0 pa-0" justify="center">
            <v-col class="fill-height ma-0 pa-0" cols="12" lg="8" md="10" sm="12">
                <v-row class="ma-0 pa-0 pt-6 px-4">
                    <v-card width="100%">
                        <v-toolbar color="primary">
                            <v-toolbar-title>
                                Updates
                            </v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-toolbar-items>
                                <app-admin-dashboard-updates-new-dialog
                                        @save="newUpdate"
                                ></app-admin-dashboard-updates-new-dialog>
                            </v-toolbar-items>
                        </v-toolbar>
                        <v-list two-line>
                            <template v-for="(item, index) in updates">
                                <v-list-item :key="index + item.id" link>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ item.date }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </template>
                        </v-list>
                    </v-card>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import axios from 'axios';
    import AppAdminDashboardUpdatesNewDialog from "./newUpdateDialog";

    export default {
        name: "app-admin-dashboard-notifications",
        components: {AppAdminDashboardUpdatesNewDialog},
        data: () => ({
            updates: []
        }),
        mounted() {
            axios.get('/app/updates').then(({data}) => {
                this.updates = data;
            }).catch(console.error);
        },
        methods: {
            newUpdate(update) {
                axios.post('/admin/updates/new', update).then(({data}) => {
                    console.log(data);
                }).catch(console.error);
            }
        }
    }
</script>