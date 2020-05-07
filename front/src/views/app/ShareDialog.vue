<template>
    <v-bottom-sheet inset overlay-opacity="0.9" v-model="dialog">
        <template v-slot:activator="{ }">
            <v-btn @click="open" class="ma-0 pa-0 px-1 pl-2" text x-large>
                    <span class="text-uppercase headline ma-0 pa-0"
                          style="font-family: Consolas,monospace !important;letter-spacing: 10px !important;">
                        {{ code }}
                    </span>
            </v-btn>
        </template>
        <v-sheet color="darker" elevation="10">
            <v-card-text class="text-center align-center justify-center ma-0 pa-0">
                <p class="display-4 py-3"
                   style="font-family: Consolas,monospace !important;letter-spacing: 0.2em !important;">
                    {{ code }}
                </p>
                <v-container class="ma-0 pa-0" fluid>
                    <v-col class="ma-0 pa-0">
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <v-img :src="`${$apiUrl}/party/qr.png?code=${code}&back=${qrBack}&front=${qrFront}`"
                                   alt="qrcode" class="elevation-0" max-width="400"></v-img>
                        </v-row>
                    </v-col>
                </v-container>
                <v-btn @click="sharePartyCode" block color="primary" height="100" tile x-large>
                    <span class="display-1 mr-5">SHARE</span>
                    <v-icon right x-large>mdi-share</v-icon>
                </v-btn>
            </v-card-text>
        </v-sheet>
    </v-bottom-sheet>
</template>

<script>

    export default {
        props: ['code'],
        name: "app-share-dialog",
        data: () => ({
            dialog: false,
            qrBack: 'ffffff',
            qrFront: '000000'
        }),
        methods: {
            sharePartyCode() {
                if (navigator.share) {
                    navigator.share({
                        title: 'UpNext Party Code',
                        text: 'Join the party!',
                        url: `https://upnext.cool/join?c=${this.code}`,
                    });
                }
            },
            handleDialog(state) {
                this.$emit('dialog', state)
            },
            open() {
                window.scrollTo(0, 0);
                this.dialog = true;
                this.handleDialog({
                    state: 'open',
                    id: 'queue',
                    close: this.close
                });
            },
            close() {
                this.dialog = false;
                this.handleDialog({
                    state: 'close',
                    id: 'queue'
                });
            },
        }
    }
</script>