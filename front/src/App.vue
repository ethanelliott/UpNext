<template>
    <transition :name="transitionName" mode="out-in">
        <router-view/>
    </transition>
</template>

<script>
    import Vue from 'vue';
    import LogRocket from 'logrocket';

    const DEFAULT_TRANSITION = 'fade';
    export default Vue.extend({
        name: 'App',
        data: () => ({
            transitionName: DEFAULT_TRANSITION
        }),
        mounted() {
            if (localStorage.getItem('userId')) {
                LogRocket.identify(localStorage.getItem('userId'));
            }
        },
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
                    this.transitionName = transitionName || DEFAULT_TRANSITION;
                }
                next();
            });
        }
    });
</script>

<style>
    body {
        background: #303030;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition-duration: 0.2s;
        transition-property: opacity;
        transition-timing-function: ease;
    }

    .fade-enter,
    .fade-leave-active {
        opacity: 0
    }
    .slide-left-enter-active,
    .slide-left-leave-active,
    .slide-right-enter-active,
    .slide-right-leave-active {
        transition-duration: 0.2s;
        transition-property: height, opacity, transform;
        transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
        overflow: hidden;
    }
    .slide-left-enter,
    .slide-right-leave-active {
        opacity: 0;
        transform: translate(2em, 0);
    }
    .slide-left-leave-active,
    .slide-right-enter {
        opacity: 0;
        transform: translate(-2em, 0);
    }
</style>
