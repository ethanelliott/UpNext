<template>
    <v-container class="fill-height ma-0 pa-0" fluid>
    </v-container>
</template>

<script>

    export default {
        name: "app-admin-logout",
        data: () => ({}),
        mounted() {
            localStorage.removeItem('admin-token');
            this.$router.push('/admin');
        },
    }
</script>