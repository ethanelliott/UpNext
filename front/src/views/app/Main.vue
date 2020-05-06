<template>
    <v-app dark style="overflow: hidden">
        <v-content align="center" justify="center">
            <transition :name="transitionName" mode="out-in">
                <router-view name="content"/>
            </transition>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'localStorage'

    const DEFAULT_TRANSITION = 'fade';
    export default {
        name: "Main",
        data: () => ({
            transitionName: DEFAULT_TRANSITION,
        }),
        created() {
            this.$router.beforeEach((to, from, next) => {
                let transitionName = to.meta.transitionName || from.meta.transitionName;
                if (transitionName === 'slide') {
                    const toDepth = to.path.split('/').length;
                    const fromDepth = from.path.split('/').length;
                    let psp = to.path.split('/');
                    transitionName = toDepth < fromDepth || psp[psp.length - 1] === "" ? 'slide-right' : 'slide-left';
                    this.transitionName = transitionName || DEFAULT_TRANSITION;
                } else if (transitionName === "none") {
                    this.transitionName = "";
                } else {
                    this.transitionName = DEFAULT_TRANSITION;
                }
                next();
            });
        },
        methods: {

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
</style>
