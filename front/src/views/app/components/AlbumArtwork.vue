<template>
    <v-dialog transition="fab-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-img :src="src" contain height="200" v-on="on"/>
        </template>
        <v-card color="darker" height="100%" width="100%">
            <v-img :src="src" contain max-width="600"/>
        </v-card>
    </v-dialog>
</template>

<script>

    export default {
        props: ['src'],
        name: "album-artwork",
        data: () => ({
            dialog: false,
        })
    }
</script>