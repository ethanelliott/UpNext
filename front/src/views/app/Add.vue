<template>
    <div class="queue">
        <v-container>
            <v-row>
                <v-col align="center" justify="center">
                    <search/>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-card>
                        <v-card-title>
                            Recommended Songs
                        </v-card-title>
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-card>
                        <v-card-title>
                            Top Playlists
                        </v-card-title>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>

</template>

<script>
    import session from 'localStorage'
    import Search from './Search'

    export default {
        name: "Queue",
        data: () => ({}),
        components: {
            'search': Search
        }
    }
</script>
