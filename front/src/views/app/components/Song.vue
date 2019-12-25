<template>
    <v-list-item>
        <v-list-item-avatar tile>
            <v-img size="60" :src="song.album.images.filter(e => e.height < 100)[0].url"/>
        </v-list-item-avatar>
        <v-list-item-content>
            <v-list-item-title>{{song.name}}</v-list-item-title>
            <v-list-item-subtitle>{{song.artists.map(e => e.name).join(', ')}}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
            <v-btn @click="addItem" color="primary" icon>
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-list-item-action>
    </v-list-item>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    export default {
        props: ['song'],
        name: "Song",
        data: () => ({}),
        mounted() {
        },
        methods: {
            addItem() {
                this.$emit('add', this.song.id)
            }
        },
    }
</script>
