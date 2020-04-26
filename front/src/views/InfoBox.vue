<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn color="primary" icon v-on="on">
                <v-icon>mdi-help</v-icon>
            </v-btn>
        </template>
        <v-card class="fill-height" color="darker">
            <v-toolbar>
                <v-toolbar-title>
                    What is UpNext?
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
        </v-card>
    </v-dialog>
</template>

<script>

    export default {
        name: "app-info-box",
        data: () => ({
            dialog: false,
        })
    }
</script>