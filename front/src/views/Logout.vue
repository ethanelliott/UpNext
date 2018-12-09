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
                                                    <v-btn block color="primary" dark large to="/join">
                                                        <span>
                                                            Join a Party
                                                        </span>
                                                    </v-btn>
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
    import session from 'sessionstorage'
    export default {
        name: "Logout",
        data: () => ({

        }),
        mounted() {
            session.clear()
            this.$router.push('/')
        }
    }
</script>

<style scoped>
    .big-text {
        font-size: 3em;
    }
</style>
