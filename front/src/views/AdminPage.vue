<template>
    <v-app>
        <v-content>
            <transition mode="out-in" name="fade">
                <router-view name="content"/>
            </transition>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    export default {
        name: 'admin-page',
        data: () => ({})
    }
</script>
