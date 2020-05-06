<template>
    <v-container class="fill-height ma-0 pa-0" fluid>
        <v-row align="center" class="fill-height ma-0 pa-0" justify="center">
            <v-col class="fill-height ma-0 pa-0" cols="12" lg="8" md="10" sm="12">
                <v-row class="ma-0 pa-0">
                    <v-card tile width="100%">
                        <v-toolbar color="green">
                            <v-toolbar-title>
                                Parties List
                            </v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-toolbar-items>
                                <v-btn @click="getPartyList" icon>
                                    <v-icon>mdi-refresh</v-icon>
                                </v-btn>
                            </v-toolbar-items>
                        </v-toolbar>
                        <v-list two-line>
                            <template v-for="(item, index) in parties">
                                <v-list-item :key="index" :to="`/admin/dashboard/parties/${item.id}`" link>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ item.code }}</v-list-item-subtitle>
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

    export default {
        name: "app-admin-dashboard-parties-home",
        data: () => ({
            parties: []
        }),
        watch: {
            id(val) {
                console.log(val);
            }
        },
        mounted() {
            this.getPartyList();
        },
        methods: {
            getPartyList() {
                axios.get('/admin/parties').then(({data}) => {
                    console.log(data);
                    this.parties = data;
                }).catch(console.error);
            }
        }
    }
</script>