<template>
    <v-app>
        <v-content>
            <v-container class="fill-height">
                <v-container>
                    <v-row align="center" justify="center">
                        <v-col align="center" cols="12" justify="center" md="3" sm="2">
                            <v-icon color="primary" size="120">mdi-music-note-plus</v-icon>
                            <p class="display-2 text-uppercase mb-10">
                                <span class="font-weight-bold">Up</span>
                                <span class="font-weight-light">Next</span>
                            </p>
                            <p class="my-10 subheading">Leaving the party...</p>
                            <v-progress-circular :size="70" :width="7" color="primary" indeterminate/>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import axios from 'axios'

    export default {
        name: 'LeavePage',
        data: () => ({}),
        mounted() {
            let context = this;
            let token = localStorage.getItem('token');
            axios.post(`/party/leave`, {token});
            localStorage.removeItem('token');
            setTimeout(() => {
                context.$router.push('/')
            }, 1500)
        }
    }
</script>
