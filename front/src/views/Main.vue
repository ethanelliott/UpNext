<template>
    <v-app dark>
        <v-dialog fullscreen hide-overlay transition="slide-x-reverse-transition" v-model="settingsDialog">
            <v-card>
                <v-toolbar color="primary" dark>
                    <v-btn @click="settingsDialog = false" dark icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Settings</v-toolbar-title>
                </v-toolbar>
                <v-container>
                    <v-flex>
                        <v-btn @click="sharePartyCode" block class="my-5" color="primary" dark large>
                            Share Party Code
                        </v-btn>
                    </v-flex>
                    <v-flex>
                        <v-btn block class="my-5" color="secondary" dark large to="/logout">
                            Logout
                        </v-btn>
                    </v-flex>

                </v-container>
            </v-card>
        </v-dialog>
        <v-toolbar app dark>
            <v-icon color="primary">music_note</v-icon>
            <v-toolbar-title class="headline text-uppercase">
                <span>Up</span>
                <span class="font-weight-light">Next</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-title class="text-uppercase">
                <span style="letter-spacing: 10px;font-family: monospace;">{{ code }}</span>
            </v-toolbar-title>
            <v-btn @click="settingsDialog = true" dark icon>
                <v-icon>settings</v-icon>
            </v-btn>
        </v-toolbar>
        <v-content>
            <transition :name="transitionName" mode="out-in">
                <router-view name="content"></router-view>
            </transition>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'localStorage'

    const DEFAULT_TRANSITION = 'slide-down';

    export default {
        name: "Main",
        data: () => ({
            drawer: null,
            code: '',
            name: '',
            admin: false,
            settingsDialog: null,
            transitionName: DEFAULT_TRANSITION
        }),
        mounted() {
            this.code = session.getItem('partyCode')
            this.name = session.getItem('partyName')
            this.admin = (session.getItem('admin') === 'true')
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
        },
        methods: {
            sharePartyCode() {
                if (navigator.share) {
                    navigator.share({
                        title: 'UpNext Party Code',
                        text: 'Join the party!',
                        url: `https://upnext.ml/join?c=${this.code}`,
                    })
                        .then(() => console.log('Successful share'))
                        .catch((error) => console.log('Error sharing', error));
                }
            }
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
