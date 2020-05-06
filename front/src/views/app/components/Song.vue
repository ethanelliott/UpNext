<template>
    <v-lazy :options="{threshold: .5}"
            min-height="73"
            transition="fade-transition"
            v-model="isActive">
        <div>
            <v-list-item>
                <v-list-item-avatar tile>
                    <v-img :src="artwork" size="60" v-if="artwork"/>
                    <v-icon v-else>mdi-music-circle</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">{{ name
                        }}
                    </v-list-item-title>
                    <v-list-item-subtitle style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">{{
                        artist }}
                    </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                    <v-btn @click="addItem" color="primary" icon large>
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-list-item-action>
            </v-list-item>
            <v-divider dark></v-divider>
        </div>
    </v-lazy>
</template>

<script>
    import axios from 'axios'

    export default {
        props: ['name', 'artist', 'artwork', 'id'],
        name: "song",
        data: () => ({
            isActive: false
        }),
        mounted() {
        },
        methods: {
            addItem() {
                this.$emit('add', this.id)
            }
        },
    }
</script>
