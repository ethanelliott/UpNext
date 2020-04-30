<template>
    <v-dialog transition="dialog-bottom-transition" v-model="dialog" width="400">
        <template v-slot:activator="{ on }">
            <v-btn class="ma-0 pa-0 px-1 pl-2" text v-on="on" x-large>
                    <span class="text-uppercase headline ma-0 pa-0"
                          style="font-family: Consolas,monospace !important;letter-spacing: 10px !important;">
                        {{ code }}
                    </span>
            </v-btn>
        </template>
        <v-card color="darker">
            <v-toolbar>
                <v-toolbar-title>
                    Share
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="text-center align-center justify-center ma-0 pa-0">
                <v-img :src="`${$apiUrl}/party/qr.png?code=${code}&back=${qrBack}&front=${qrFront}`"
                       alt="qrcode" class="elevation-0" max-width="400"></v-img>
                <p class="display-4 my-7" style="font-family: Consolas,monospace !important;">
                    {{ code }}
                </p>
                <v-btn @click="sharePartyCode" block color="primary" height="100" tile x-large>
                    <span class="display-1 mr-5">SHARE</span>
                    <v-icon right x-large>mdi-share</v-icon>
                </v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
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
        }
    }
</script>