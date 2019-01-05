<template>
    <v-container fluid>
        <v-layout align-center justify-center>
            <v-flex xs12>
                <v-card>
                    <v-card-title class="headline">
                        UpNext Admin Panel
                    </v-card-title>
                    <v-card-text>
                        <v-list subheader>
                            <v-subheader>Current Parties</v-subheader>
                            <template v-for="(party, index) in parties">
                                <v-list-tile :key="party._id" avatar>
                                    <v-list-tile-content>
                                        <v-list-tile-title>{{ party.name }}</v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action>
                                        <v-btn :to="'/stats/admin/party/' + party._id" color="primary" flat icon>
                                            <v-icon>arrow_forward</v-icon>
                                        </v-btn>
                                    </v-list-tile-action>
                                </v-list-tile>
                                <v-divider
                                        :key="index"
                                        v-if="index + 1 < parties.length"
                                ></v-divider>
                            </template>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import io from 'socket.io-client'

    export default {
        name: "AdminStats",
        data: () => ({
            socket: null,
            eventLoop: null,
            drawer: null,
            parties: []
        }),
        beforeDestroy() {
            clearInterval(this.eventLoop)
            this.socket.disconnect()
        },
        mounted() {
            let context = this
            this.socket = io(this.$socketPath)
            this.socket.on('connect', () => {
                this.eventLoop = setInterval(() => {
                    context.socket.emit('get-parties')
                }, 500)
                this.socket.on('disconnect', () => {
                })
            })
            this.socket.on('give-parties', (data) => {
                context.parties = data
            })
        },
        methods: {}
    }
</script>
