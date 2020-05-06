<template>
    <v-container class="fill-height ma-0 pa-0" fluid>
        <v-row align="center" class="ma-0 pa-0" justify="center">
            <v-col class="ma-0 pa-0" cols="12" lg="3">
                <v-card elevation="10">
                    <v-overlay absolute opacity="0.6" v-if="loading">
                        <v-progress-circular color="primary" indeterminate size="100" width="5"></v-progress-circular>
                    </v-overlay>
                    <v-toolbar color="primary" elevation="0">
                        <v-toolbar-title>Admin Register</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                                    label="Login"
                                    name="login"
                                    prepend-icon="mdi-account"
                                    type="text"
                                    v-model="username"
                            />
                            <v-text-field
                                    id="password"
                                    label="Password"
                                    name="password"
                                    prepend-icon="mdi-lock"
                                    type="password"
                                    v-model="password"
                            />
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer/>
                        <v-btn @click="register" color="primary">Register</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import sha512 from 'sha512';
    import axios from 'axios';

    export default {
        name: "app-admin-register",
        data: () => ({
            loading: false,
            username: '',
            password: ''
        }),
        mounted() {
            if (localStorage.getItem('admin-token')) {
                this.$router.push('/admin/dashboard');
            }
        },
        methods: {
            register() {
                this.loading = true;
                const hashPass = sha512(this.password).toString('hex');
                axios.post('/admin/register', {
                    username: this.username,
                    password: hashPass
                }).then(e => {
                    this.loading = false;
                    this.$router.push('/admin');
                }).catch(e => {
                    this.loading = false;
                    console.error(e);
                });
            }
        }
    }
</script>