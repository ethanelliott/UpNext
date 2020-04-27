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
                            <p class="my-10 subheading">Getting the party started...</p>
                            <v-progress-circular :size="70" :width="7" color="primary" indeterminate/>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    export default {
        name: 'MakePage',
        props: ['token'],
        data: () => ({}),
        mounted() {
            let context = this;
            let joinToken = context.$route.params.token;
            axios.post(`/party/join?token=${joinToken}`).then(res => {
                session.setItem('token', res.data.token); // set token for reqs to the party
                session.setItem('userId', res.data.userId); // set userId for log rocket
                // then make the user wait so they can look at the pretty screen
                setTimeout(() => {
                    context.$router.push('/app/home')
                }, 1500)
            }).catch(err => {
            })
        }
    }
</script>
