<template>
    <v-container fluid>
        <v-layout align-center justify-center>
            <v-flex lg8 md10 sm10 xl4 xs12>
                <v-data-table :expand="expand" :headers="headers" :items="parties" hide-actions item-key="id">
                    <template v-slot:items="props">
                        <tr @click="props.expanded = !props.expanded">
                            <td>{{ props.item.name }}</td>
                            <td class="">{{ props.item.code }}</td>
                            <td class="text-xs-right">{{ props.item.queue }}</td>
                            <td class="text-xs-right">{{ props.item.user }}</td>
                            <td class="text-xs-right">{{ props.item.skip }}</td>
                            <td class="">{{ (new Date(props.item.start)).toLocaleString() }}</td>
                        </tr>
                    </template>
                    <template v-slot:expand="props">
                        <v-card flat>
                            <v-container fluid>
                                <v-layout align-center justify-center>
                                    <v-flex>
                                        <!--                                        <v-btn block class="my-5" color="primary" dark large>-->
                                        <!--                                            Clear the Queue-->
                                        <!--                                        </v-btn>-->
                                        <v-btn @click="fixChromeCastBug(props.item.id)" block class="my-5"
                                               color="primary" dark large>
                                            Fix Chrome Stop Error
                                        </v-btn>
                                        <v-btn @click="deleteParty(props.item.id)" block class="my-5" color="red" dark
                                               large>
                                            DELETE PARTY
                                        </v-btn>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card>
                    </template>
                </v-data-table>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import session from 'localStorage'
    import sha512 from 'sha512'
    import io from 'socket.io-client'

    export default {
        name: "AdminHome",
        data: () => ({
            socket: null,
            expand: false,
            headers: [
                {text: 'Name', align: 'left', value: 'name'},
                {text: 'Code', align: 'left', value: 'code'},
                {text: 'Queue', value: 'queue'},
                {text: 'Users', value: 'user'},
                {text: 'Vote Skip', value: 'skip'},
                {text: 'Start', align: 'left', value: 'start'}
            ],
            parties: []
        }),
        beforeDestroy() {
            this.socket.disconnect()
        },
        mounted() {
            let t = this
            if (session.getItem('adminState') !== sha512('ethan').toString('hex')) {
                this.$router.push('/a')
            } else {
                t.socket = io(t.$socketPath)
                t.socket.on('connect', () => {
                    t.socket.on('disconnect', () => {
                    })
                })
                t.socket.on('got-admin-data', (data) => {
                    t.parties = data.data
                })
                this.refresh()
            }
        },
        methods: {
            refresh() {
                console.log('refreshing')
                this.socket.emit('get-admin-data')
            },
            fixChromeCastBug(partyID) {
                this.socket.emit('admin-fix-cast', partyID)
            },
            deleteParty(partyID) {
                this.socket.emit('admin-delete-party', partyID)
                this.refresh()
            }
        }
    }
</script>

<style>

</style>
