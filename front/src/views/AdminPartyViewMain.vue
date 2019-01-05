<template>
    <v-container fill-height fluid v-if="loading">
        <v-layout align-center justify-center>
            <v-flex class="text-xs-center">
                <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
            </v-flex>
        </v-layout>
    </v-container>
    <v-container class="pa-0" fluid v-else>
        <v-layout align-center justify-center>
            <v-flex xs12>
                <v-card>
                    <v-toolbar color="secondary" dark tabs>
                        <v-spacer></v-spacer>
                        <v-toolbar-title>{{ partyData.name }}</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-tabs color="secondary" grow slot="extension" v-model="tab">
                            <v-tabs-slider color="primary"></v-tabs-slider>
                            <v-tab :key="item" v-for="item in items">
                                {{ item }}
                            </v-tab>
                        </v-tabs>
                    </v-toolbar>
                    <v-tabs-items v-model="tab">
                        <v-tab-item key="home">
                            <v-card flat>
                                <v-card-text>
                                    {{ partyData.code }}
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item key="users">
                            <v-card flat>
                                <v-data-table :headers="usertable.headers" :items="partyData.users" class="elevation-5"
                                              hide-actions>
                                    <template slot="items" slot-scope="props">
                                        <td>{{ props.item.nickname }}</td>
                                        <td class="text-xs-right">{{ props.item.score }}</td>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item key="playlist">
                            <v-card flat>
                                <v-data-table :headers="playlisttable.headers" :items="partyData.playlist"
                                              class="elevation-5" hide-actions>
                                    <template slot="items" slot-scope="props">
                                        <tr @click="props.expanded = !props.expanded">
                                            <td class="text-xs-left">{{ props.item.name }}</td>
                                            <td class="text-xs-left">{{ props.item.artist }}</td>
                                            <td class="text-xs-right">{{ props.item.votes }}</td>
                                        </tr>
                                    </template>
                                    <template slot="expand" slot-scope="props">
                                        <v-card flat>
                                            <v-layout align-center justify-center row v-if="!loading" wrap>
                                                <v-container>
                                                    <v-layout>
                                                        <v-flex xs12>
                                                            <v-container>
                                                                <v-layout align-center justify-start>
                                                                    <v-flex xs3>
                                                                        <img :src="props.item.artwork"
                                                                             class="elevation-5"
                                                                             style="width:80%; max-width: 200px;"/>
                                                                    </v-flex>
                                                                    <v-flex fill-height>
                                                                        <span class="font-weight-bold">{{ props.item.name }}</span><br>
                                                                        <span class="font-weight-light">{{ props.item.artist }}</span><br>
                                                                        <span class="">Added By: {{ props.item.added.name }}</span><br>
                                                                        <span>Upvoters: {{ props.item.upvoters.length }}</span><br>
                                                                        <span>Downvoters: {{ props.item.downvoters.length }}</span><br>
                                                                    </v-flex>
                                                                </v-layout>
                                                            </v-container>
                                                        </v-flex>
                                                    </v-layout>
                                                </v-container>
                                            </v-layout>
                                        </v-card>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item key="history">
                            <v-card flat>
                                <v-card-text>HELLO</v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item key="stats">
                            <v-card flat>
                                <v-card-text>HELLO</v-card-text>
                            </v-card>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import io from 'socket.io-client'
    import session from 'sessionstorage'

    export default {
        name: "AdminPartyView",
        data: () => ({
            partyID: '',
            loading: true,
            socket: null,
            eventLoop: null,
            drawer: null,
            partyData: null,
            tab: null,
            items: ['home', 'users', 'playlist', 'history', 'stats'],
            usertable: {
                headers: [
                    {text: 'Nickname', value: 'nickname'},
                    {text: 'Score', value: 'score', align: 'right'},
                ]
            },
            playlisttable: {
                headers: [
                    {text: 'Name', value: 'name'},
                    {text: 'Artist', value: 'artist'},
                    {text: 'Votes', value: 'votes'},
                ]
            }
        }),
        beforeDestroy() {
            clearInterval(this.eventLoop)
            this.socket.disconnect()
        },
        mounted() {
            let context = this
            this.partyID = session.getItem('partyID')
            this.socket = io(this.$socketPath)
            this.socket.on('connect', () => {
                this.eventLoop = setInterval(() => {
                    context.socket.emit('get-party-data', {id: context.partyID})
                }, 500)
                this.socket.on('disconnect', () => {
                })
            })
            this.socket.on('give-party-data', (data) => {
                if (data) {
                    this.loading = false
                    context.partyData = data
                } else {
                    this.loading = true
                }
            })
        },
        methods: {}
    }
</script>
