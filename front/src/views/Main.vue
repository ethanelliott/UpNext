<template>
    <v-app dark>
        <v-navigation-drawer app fixed v-model="drawer">
            <v-list>
                <v-list-tile to="/main/home">
                    <v-list-tile-action>
                        <v-icon>home</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Home</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile to="/main/queue">
                    <v-list-tile-action>
                        <v-icon>add</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Queue</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar app dark>
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title class="headline text-uppercase">
                <span>Up</span>
                <span class="font-weight-light">Next</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-content>
            <router-view name="content"></router-view>
        </v-content>
    </v-app>
</template>

<script>
    export default {
        name: "Main",
        data: () => ({
            drawer: null
        })
    }
</script>
