<template>
    <v-menu :close-on-content-click="false" offset-y v-model="menu">
        <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" x-large>
                <v-icon>mdi-account</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text to="/admin/logout">Logout</v-btn>
            </v-card-actions>
        </v-card>
    </v-menu>
</template>

<script>
    import axios from 'axios';

    export default {
        name: "app-admin-user-menu",
        data: () => ({
            menu: false
        }),
        watch: {
            menu(val) {
                if (val) {
                    console.log(val);
                }
            }
        },
        mounted() {
        },
    }
</script>