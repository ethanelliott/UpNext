<template>
    <v-app color="accent" dark>
        <v-content>
            <v-container fill-height fluid>
                <v-layout align-center justify-center>
                    <v-flex lg6 md8 sm8 xs10>
                        <v-card class="elevation-12" color="secondary">
                            <v-card-text>
                                <v-container grid-list-xl column>
                                    <v-layout>
                                        <v-flex>
                                            <v-card flat color="secondary">
                                                <v-card-text>
                                                    <p class="text-xs-center big-text text-uppercase">
                                                        <span>Up</span>
                                                        <span class="font-weight-light">Next</span>
                                                    </p>
                                                </v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout>
                                        <v-flex>
                                            <v-card flat color="secondary">
                                                <v-card-text>
                                                    <p class="text-xs-center text-uppercase">
                                                        <span>This is your party code:</span>
                                                    </p>
                                                    <p class="text-xs-center text-uppercase" style="font-size: 2em; font-family: 'Consolas', monospace;letter-spacing: 15px;">
                                                        <span class="font-weight-light">4f1p</span>
                                                    </p>
                                                </v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    export default {
        name: "Callback",
        data: () => ({

        })
    }
</script>

<style scoped>
    .big-text {
        font-size: 3em;
    }
</style>
