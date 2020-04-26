<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn color="primary" dark icon v-on="on">
                <v-icon>mdi-qrcode-scan</v-icon>
            </v-btn>
        </template>
        <v-card class="fill-height" color="black">
            <v-overlay :value="loading" absolute opacity="0.6">
                <v-progress-circular color="primary" indeterminate size="150" width="15"></v-progress-circular>
            </v-overlay>
            <v-toolbar color="primary">
                <v-toolbar-title>Scan a QR Code</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <qrcode-stream @decode="onDecode" @init="onInit" v-if="dialog"/>
        </v-card>
    </v-dialog>
</template>

<script>
    import {QrcodeStream} from 'vue-qrcode-reader'

    export default {
        name: "app-qr-scanner",
        components: {QrcodeStream},
        data: () => ({
            dialog: false,
            loading: false
        }),
        methods: {
            onDecode(result) {
                this.loading = true;
                const regex = /\?c=([A-Z,0-9]{4})$/g;
                const found = [...result.matchAll(regex)][0][1];
                console.log(found);
                this.$emit('code', found);
                setTimeout(() => {
                    this.dialog = false;
                    this.loading = false;
                }, 1000);
            },

            async onInit(promise) {
                try {
                    await promise
                } catch (error) {
                    if (error.name === 'NotAllowedError') {
                        this.error = "ERROR: you need to grant camera access permisson"
                    } else if (error.name === 'NotFoundError') {
                        this.error = "ERROR: no camera on this device"
                    } else if (error.name === 'NotSupportedError') {
                        this.error = "ERROR: secure context required (HTTPS, localhost)"
                    } else if (error.name === 'NotReadableError') {
                        this.error = "ERROR: is the camera already in use?"
                    } else if (error.name === 'OverconstrainedError') {
                        this.error = "ERROR: installed cameras are not suitable"
                    } else if (error.name === 'StreamApiNotSupportedError') {
                        this.error = "ERROR: Stream API is not supported in this browser"
                    }
                    console.log(this.error);
                }
            }
        }
    }
</script>

<style scoped>

</style>