<template>
    <v-app dark>
        <v-app-bar :extended="extended" app dark color="darker">
            <v-icon color="primary">mdi-music-note-plus</v-icon>
            <v-toolbar-title class="headline text-uppercase ml-3">
                <span>Up</span>
                <span class="font-weight-light">Next</span>
            </v-toolbar-title>
            <v-spacer/>
            <v-toolbar-items>
                <v-btn @click="sharePartyCode" text x-large>
                    <span class="text-uppercase" style="letter-spacing: 10px;font-family: monospace;">{{ code }}</span>
                </v-btn>
            </v-toolbar-items>
            <template #extension v-if="extended">
                <v-btn :to="previousPage" icon>
                    <v-icon>mdi-arrow-left-circle</v-icon>
                </v-btn>
                <v-toolbar-title>
                    {{pageTitle}}
                </v-toolbar-title>
                <v-spacer/>
                <v-toolbar-items>
                </v-toolbar-items>
            </template>
        </v-app-bar>
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
            code: 'CODE',
            transitionName: DEFAULT_TRANSITION,
            extended: false,
            pageTitle: '',
            previousPage: ''
        }),
        mounted() {
            this.checkCurrentPage(this.$route.path);
        },
        created() {
            this.$router.beforeEach((to, from, next) => {
                this.checkCurrentPage(to.path);
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
            checkCurrentPage(path) {
                if (path.includes('home')) {
                    this.extended = false;
                    this.pageTitle = '';
                    this.previousPage = '';
                } else {
                    this.extended = true;
                    let p = path.split('/')
                    let s = p[p.length - 1]
                    switch (s) {
                        case 'queue':
                            this.pageTitle = 'Queue';
                            this.previousPage = '/app/home';
                            break;
                        case 'add':
                            this.pageTitle = "Add a Song";
                            this.previousPage = '/app/home';
                            break;
                        default:
                            this.pageTitle = "";
                    }
                }
            },
            sharePartyCode() {
                if (navigator.share) {
                    navigator.share({
                        title: 'UpNext Party Code',
                        text: 'Join the party!',
                        url: `https://upnext.cool/join?c=${this.code}`,
                    })
                        .then(() => {
                        })
                        .catch((error) => {
                        });
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
</style>
