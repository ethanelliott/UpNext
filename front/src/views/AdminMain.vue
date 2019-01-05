<template>
    <v-app dark>
        <v-navigation-drawer absolute app color="accent" floating overflow temporary v-model="drawer">

        </v-navigation-drawer>
        <v-toolbar app color="primary" fixed>
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
        name: "AdminMain",
        data: () => ({
            drawer: null
        }),
        mounted() {
        },
        methods: {}
    }
</script>
