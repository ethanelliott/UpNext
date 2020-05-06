<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn color="primary" icon v-on="on">
                <v-icon>mdi-help</v-icon>
            </v-btn>
        </template>
        <v-card color="darker">
            <v-toolbar>
                <v-toolbar-title>
                    <v-icon color="primary" left>mdi-music-note-plus</v-icon>
                    About
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text>
                <v-container>
                    <v-col>
                        <v-row>
                            <h1 class="headline mb-5">What is <span class="primary--text">UpNext</span>?</h1>
                        </v-row>
                        <v-row class="mb-5">
                            UpNext is a party-oriented real-time vote-based playlist generation application with spotify
                            integration.
                        </v-row>
                        <v-row class="mb-5">
                            In other words, it allows you to use one spotify account to run a party,
                            and everyone at the party can add songs to the playlist,
                            and upvote or downvote the songs they like or dislike. Every upvote is a point, and
                            every downvote is minus one point, and there is a running tally on a scoreboard
                            <br><br>
                            This takes away the pressure from one person to play all the right music, and lets everyone
                            take control.
                        </v-row>
                        <v-row>
                            <h1 class="headline mb-5">How does it work?</h1>
                        </v-row>
                        <v-row class="mb-5">
                            One person with a spotify account can connect to the speakers, and play some music. Then,
                            they can create a party on UpNext and link their spotify account.
                            At this point, UpNext can take control and start playing music from the queue.
                            The most up-voted song in the queue at the end of the current song, will be played.
                            The party will last for a maximum of 24 hours, and then it will be deleted along with your
                            spotify token.
                            <br><br>
                            Any song played during the party is added to a public spotify playlist named after the
                            party.
                            <br><br>
                        </v-row>
                        <v-row>
                            <h1 class="headline mb-5">Support me</h1>
                        </v-row>
                        <v-row>
                            <link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet">
                            <a class="bmc-button" href="https://www.buymeacoffee.com/upnext" target="_blank">
                                <img alt="Buy me a coffee"
                                     src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg">
                                <span style="margin-left:15px;font-size:28px !important;">Buy me a coffee</span>
                            </a>
                        </v-row>
                    </v-col>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>

    export default {
        name: "app-info-box",
        data: () => ({
            dialog: false,
        })
    }
</script>

<style>
    .bmc-button img {
        height: 34px !important;
        width: 35px !important;
        margin-bottom: 1px !important;
        box-shadow: none !important;
        border: none !important;
        vertical-align: middle !important;
    }

    .bmc-button {
        padding: 7px 10px 7px 10px !important;
        line-height: 35px !important;
        height: 51px !important;
        min-width: 217px !important;
        text-decoration: none !important;
        display: inline-flex !important;
        color: #ffffff !important;
        background-color: #79D6B5 !important;
        border-radius: 5px !important;
        border: 1px solid transparent !important;
        font-size: 28px !important;
        letter-spacing: 0.6px !important;
        box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;
        -webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
        margin: 0 auto !important;
        font-family: 'Cookie', cursive !important;
        -webkit-box-sizing: border-box !important;
        box-sizing: border-box !important;
        -o-transition: 0.3s all linear !important;
        -webkit-transition: 0.3s all linear !important;
        -moz-transition: 0.3s all linear !important;
        -ms-transition: 0.3s all linear !important;
        transition: 0.3s all linear !important;
    }

    .bmc-button:hover, .bmc-button:active, .bmc-button:focus {
        -webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
        text-decoration: none !important;
        box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
        opacity: 0.85 !important;
        color: #ffffff !important;
    }
</style>