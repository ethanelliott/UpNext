<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn @click="open" block class="my-5" color="primary" large rounded>
                <v-icon left>mdi-magnify</v-icon>
                Search
            </v-btn>
        </template>
        <v-card>
            <v-app-bar fixed color="darker" extended>
                <v-btn @click="close" dark icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-text-field @input="isTypingSearch = true" autofocus clearable full-width
                              hide-details label="search for something" prepend-inner-icon="mdi-magnify"
                              single-line v-model="query"/>
                <v-tabs slot="extension" v-model="tabs" background-color="transparent" fixed-tabs>
                    <v-tab>Songs</v-tab>
                    <v-tab>Albums</v-tab>
                    <v-tab>Artists</v-tab>
                    <v-tab>Playlists</v-tab>
                </v-tabs>
            </v-app-bar>
            <v-container class="mt-10" v-if="!loading && !loaded">
                <v-container class="mt-10">
                    <v-row>
                        <v-col align="center" justify="center">
                            <v-card class="mt-10" color="transparent" flat>
                                <v-icon color="primary" size="100">mdi-magnify</v-icon>
                                <h2>What are you looking for?</h2>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>
            <v-container class="mt-10" v-else>
                <v-tabs-items v-model="tabs">
                    <v-tab-item>
                        <v-list class="mt-10" v-if="loading">
                            <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                        </v-list>
                        <v-list class="mt-10" v-else-if="loaded">

                        </v-list>
                    </v-tab-item>
                    <v-tab-item>
                        <v-list class="mt-10" v-if="loading">
                            <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                        </v-list>
                        <v-list class="mt-10" v-else-if="loaded">

                        </v-list>
                    </v-tab-item>
                    <v-tab-item>
                        <v-list class="mt-10" v-if="loading">
                            <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                        </v-list>
                        <v-list class="mt-10" v-else-if="loaded">

                        </v-list>
                    </v-tab-item>
                    <v-tab-item>
                        <v-list class="mt-10" v-if="loading">
                            <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                        </v-list>
                        <v-list class="mt-10" v-else-if="loaded">

                        </v-list>
                    </v-tab-item>
                </v-tabs-items>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    function debounce(func, wait = 100) {
        let timeout
        return function (...args) {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                func.apply(this, args)
            }, wait)
        }
    }

    export default {
        name: "Search",
        tokens: ['searchResult'],
        data: () => ({
            token: '',
            loading: false,
            loaded: false,
            dialog: false,
            isTypingSearch: false,
            query: '',
            tabs: null
        }),
        mounted() {
            this.token = session.getItem('token');
        },
        methods: {
            open() {
                this.dialog = true;
            },
            close() {
                this.dialog = false;
            },
            search() {
                if (this.query !== "") {
                    this.loading = true
                    this.$emit('search', this.query)
                } else {
                    this.loading = false;
                    this.items = []
                }
            },
        },
        watch: {
            query: debounce(function () {
                this.isTypingSearch = false
            }, 500),
            isTypingSearch: function (value) {
                if (!value) {
                    this.search()
                }
            }
        },
    }
</script>
