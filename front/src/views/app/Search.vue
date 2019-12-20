<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn @click="dialog = true" block class="my-10" color="primary" large rounded>
                <v-icon left>mdi-magnify</v-icon>
                Search
            </v-btn>
        </template>
        <v-card>
            <v-toolbar color="darker" extended>
                <v-btn @click="dialog = false" dark icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Search</v-toolbar-title>
                <template #extension>
                    <v-text-field autofocus clearable dense full-width
                                  hide-details label="search for something" prepend-inner-icon="mdi-magnify"
                                  single-line/>
                </template>
            </v-toolbar>
            <v-container v-if="!loading && !loaded">
                <v-container>
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
            <v-container v-else>
                <v-list v-if="loading">
                    <template v-for="(item, index) in items">
                        <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"
                                           v-bind:key="index"/>
                    </template>
                </v-list>
                <v-list v-else-if="loaded">
                    <template v-for="(item, index) in items">
                        <v-list-item three-line v-bind:key="index">
                            <v-list-item-avatar tile>
                                <v-img src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"/>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>Three-line item</v-list-item-title>
                                <v-list-item-subtitle>
                                    Secondary line text Lorem ipsum dolor sit amet,
                                </v-list-item-subtitle>
                                <v-list-item-subtitle>
                                    consectetur adipiscing elit. {{item}}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-list>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'

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
        data: () => ({
            loading: false,
            loaded: false,
            dialog: false,
            notifications: false,
            sound: true,
            widgets: false,
            items: new Array(10).fill(0)
        }),
        watch: {},

    }
</script>
