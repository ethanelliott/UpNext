<template>
    <v-container class="fill-height">
        <v-container>
            <v-row>
                <v-col align="center" justify="center">
                    <v-card color="transparent" flat max-width="400">
                        <v-img :src="albumArtwork" max-width="400" min-height="300"/>
                        <v-card-text align="start" class="mb-0">
                            <span class="headline font-weight-medium text--primary">{{trackName}}</span>
                            <br>
                            <span class="font-weight-thin font-italic text--primary">{{trackArtist}}</span>
                        </v-card-text>
                    </v-card>
                    <v-card color="transparent" flat max-width="400">
                        <v-container>
                            <v-row align-content="space-around" justify="space-around">
                                <v-btn depressed height="80" to="/app/queue" width="80">
                                    <v-icon size="50">mdi-playlist-music</v-icon>
                                </v-btn>
                                <v-btn color="primary" depressed height="80" to="/app/add" width="80">
                                    <v-icon size="50">mdi-music-note-plus</v-icon>
                                </v-btn>
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-footer dark fixed>
            <v-container align="center" justify="center">
                <v-row align="center" justify="center">
                    <v-progress-linear class="my-0" color="primary" height="10"/>
                </v-row>
            </v-container>
        </v-footer>
    </v-container>
</template>

<script>
    import session from 'localStorage'

    export default {
        name: "Home",
        data: () => ({
            albumArtwork: 'https://discussions.apple.com/content/attachment/881765040',
            trackName: 'TEST',
            trackArtist: 'TEST'
        })
    }
</script>
