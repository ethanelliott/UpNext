<template>
    <v-app dark>
        <v-toolbar app dark>
            <v-icon color="primary">music_note</v-icon>
            <v-toolbar-title class="headline text-uppercase">
                <span>Up</span>
                <span class="font-weight-light">Next</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>
        <v-content>
            <transition :name="transitionName" mode="out-in">
                <router-view name="content"></router-view>
            </transition>
        </v-content>
    </v-app>
</template>

<script>

    const DEFAULT_TRANSITION = 'slide-down';

    export default {
        name: "Admin",
        data: () => ({
            drawer: null,
            code: '',
            name: '',
            admin: false,
            settingsDialog: null,
            transitionName: DEFAULT_TRANSITION
        }),
        mounted() {

        },
        created() {
            this.$router.beforeEach((to, from, next) => {
                let transitionName = to.meta.transitionName || from.meta.transitionName;
                if (transitionName === 'slide') {
                    const toDepth = to.path.split('/').length
                    const fromDepth = from.path.split('/').length
                    let psp = to.path.split('/')
                    transitionName = toDepth < fromDepth || psp[psp.length - 1] === "" ? 'slide-down' : 'slide-up'
                    this.transitionName = transitionName || DEFAULT_TRANSITION
                }
                this.transitionName = transitionName || DEFAULT_TRANSITION
                next()
            })
        }
    }
</script>

<style>
    .fade-enter-active,
    .fade-leave-active {
        transition-duration: 0.3s;
        transition-property: opacity;
        transition-timing-function: ease;
    }

    .fade-enter,
    .fade-leave-active {
        opacity: 0
    }

    .slide-up-enter-active,
    .slide-up-leave-active,
    .slide-down-enter-active,
    .slide-down-leave-active {
        transition-duration: 0.3s;
        transition-property: height, opacity, transform;
        transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
        overflow: hidden;
    }

    .slide-up-enter,
    .slide-down-leave-active {
        opacity: 0;
        transform: translate(0, 2em);
    }

    .slide-up-leave-active,
    .slide-down-enter {
        opacity: 0;
        transform: translate(0, -2em);
    }
</style>
