<template>
    <v-container
            :style="'transition:all 1s; background-image: linear-gradient(' + progressColourBackground + ' 10%, rgba(0,0,0,1) 90%);'"
            fill-height fluid>
        <v-dialog dark v-model="voteDialog" width="500">
            <v-card>
                <v-card-actions>
                    <v-btn @click="downvoteSong" color="primary" flat>
                        Downvote
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click="upvoteSong" color="primary" flat>
                        Upvote
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog fullscreen transition="dialog-bottom-transition" v-model="queueDialog">
            <v-card fill-height height="100%">
                <v-toolbar dark fixed>
                    <v-btn @click="closeQueue" dark icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Queue</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <!--                    <v-flex v-if="searchQueue">-->
                    <!--                        <v-text-field box clearable label="Search" v-model="searchString"></v-text-field>-->
                    <!--                    </v-flex>-->
                    <!--                    <v-btn @click="searchQueue = !searchQueue" dark icon>-->
                    <!--                        <v-icon>search</v-icon>-->
                    <!--                    </v-btn>-->
                </v-toolbar>
                <v-flex align-center height="100%" justify-center v-if="queue.length <= 0">
                    <v-flex class="text-xs-center pt-5">
                        <v-icon class="pt-5" color="primary" size="120">music_note</v-icon>
                        <p class="pt-5 title">The Queue is Empty!</p>
                        <p class="pt-2 subheading">Click the + below to get the party started</p>
                    </v-flex>
                </v-flex>
                <v-flex offset-sm3 sm6 v-else xs12>
                    <v-list class="mt-5 pt-2" two-line>
                        <template v-for="(track, index) in queue">
                            <v-list-tile :key="track.title" @click="showVoteDialog(track)" avatar>
                                <v-list-tile-avatar tile>
                                    <img :src="track.artwork">
                                </v-list-tile-avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>{{ track.name }}</v-list-tile-title>
                                    <v-list-tile-sub-title class="text--primary">{{ track.artist }}
                                    </v-list-tile-sub-title>
                                    <v-list-tile-sub-title>Added By: {{ track.added.name }}</v-list-tile-sub-title>
                                </v-list-tile-content>
                                <v-list-tile-action>
                                    <v-btn color="primary" flat icon>
                                        <span>{{ track.votes }}</span>
                                    </v-btn>
                                </v-list-tile-action>
                            </v-list-tile>
                            <v-divider
                                    :key="index"
                                    v-if="index + 1 < queue.length"
                            ></v-divider>
                        </template>
                    </v-list>
                </v-flex>
                <v-speed-dial bottom class="ma-2" direction="top" right style="position: fixed; bottom:0;right:0;"
                              transition="slide-y-reverse-transition" v-model="fab">
                    <v-btn @click="showSearch" color="primary" dark fab slot="activator">
                        <v-icon>add</v-icon>
                    </v-btn>
                </v-speed-dial>
            </v-card>
        </v-dialog>
        <v-dialog fullscreen transition="scale-transition" v-model="searchDialog">
            <v-card>
                <v-toolbar dark fixed tabs>
                    <v-btn @click="closeSearch" dark icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-text-field @input="isTypingSearch = true" box clearable label="Search for music here"
                                  v-model="searchString"></v-text-field>
                    <template slot="extension">
                        <v-tabs color="darker" grow slider-color="primary" v-model="searchTabs">
                            <v-tab @click="songsTab" key="songs">Songs</v-tab>
                            <v-tab @click="albumsTab" key="albums">Albums</v-tab>
                            <v-tab @click="artistsTab" key="artists">Artists</v-tab>
                            <v-tab @click="playlistsTab" key="playlists">Playlists</v-tab>
                        </v-tabs>
                    </template>
                </v-toolbar>
                <p class="my-2">&nbsp;</p>
                <p class="my-4">&nbsp;</p>
                <v-tabs-items v-model="searchTabs">
                    <v-tab-item key="songs">
                        <v-card flat>
                            <v-list class="" two-line>
                                <template v-for="(track, index) in searchResults.tracks">
                                    <v-list-tile :key="track.id" avatar>
                                        <v-list-tile-avatar tile>
                                            <img :src="track.artwork">
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{ track.name }}</v-list-tile-title>
                                            <v-list-tile-sub-title class="text--primary">{{ track.artist }}
                                            </v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-btn @click="addSongToPlaylist(track)" color="primary" flat icon>
                                                <v-icon large>add</v-icon>
                                            </v-btn>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider
                                            :key="index"
                                            v-if="index + 1 < searchResults.tracks.length"
                                    ></v-divider>
                                </template>
                            </v-list>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item key="albums">
                        <v-card flat>
                            <v-list class="" two-line>
                                <template v-for="(album, index) in searchResults.albums">
                                    <v-list-tile :key="album.title" @click="showAlbumDialog(album)" avatar>
                                        <v-list-tile-avatar tile>
                                            <img :src="album.artwork" v-if="album.artwork">
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{ album.name }}</v-list-tile-title>
                                            <v-list-tile-sub-title class="text--primary">{{ album.artist }}
                                            </v-list-tile-sub-title>
                                        </v-list-tile-content>
                                    </v-list-tile>
                                    <v-divider
                                            :key="index"
                                            v-if="index + 1 < searchResults.tracks.length"
                                    ></v-divider>
                                </template>
                            </v-list>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item key="artists">
                        <v-card flat>
                            <v-list class="" two-line>
                                <template v-for="(artist, index) in searchResults.artists">
                                    <v-list-tile :key="artist.title" @click="showArtistDialog(artist)" avatar>
                                        <v-list-tile-avatar tile>
                                            <img :src="artist.images[0].url" v-if="artist.images.length > 0">
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{ artist.name }}</v-list-tile-title>
                                            <v-list-tile-sub-title class="text--primary">{{ artist.artist }}
                                            </v-list-tile-sub-title>
                                        </v-list-tile-content>
                                    </v-list-tile>
                                    <v-divider
                                            :key="index"
                                            v-if="index + 1 < searchResults.artists.length"
                                    ></v-divider>
                                </template>
                            </v-list>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item key="playlists">
                        <v-card flat>
                            <v-list class="" two-line>
                                <template v-for="(track, index) in searchResults.playlists">
                                    <v-list-tile :key="track.title" @click="">
                                        <v-list-tile-avatar tile>
                                            <img :src="track.images[0].url" v-if="track.images.length > 0">
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{ track.name }}</v-list-tile-title>
                                            <v-list-tile-sub-title class="text--primary">{{ track.artist }}
                                            </v-list-tile-sub-title>
                                        </v-list-tile-content>
                                    </v-list-tile>
                                    <v-divider
                                            :key="index"
                                            v-if="index + 1 < searchResults.playlists.length"
                                    ></v-divider>
                                </template>
                            </v-list>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
            </v-card>
        </v-dialog>
        <v-dialog max-width="700px" persistent scrollable v-model="albumDialog">
            <v-card>
                <v-card-title>
                    <v-btn @click="closeAlbumDialog" dark icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                    <span>Album</span>
                </v-card-title>
                <v-card-text>
                    <v-flex>
                        <v-layout justify-center>
                            <v-flex class="text-xs-center">
                                <img :src="albumSearchDialogData.artwork" class="elevation-20"
                                     style="width:100%;max-width: 25vh;"/>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex>
                        <v-layout justify-center>
                            <v-flex class="text-xs-center">
                                <span class="headline font-weight-medium">{{albumSearchDialogData.name}}</span>
                                <p class="subheading font-weight-thin font-italic">{{albumSearchDialogData.artist}}</p>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-list class="" two-line>
                        <template v-for="(track, index) in albumSearchDialogData.tracks">
                            <v-list-tile :key="track.id" avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>{{ track.name }}</v-list-tile-title>
                                    <v-list-tile-sub-title class="text--primary">{{ track.artist }}
                                    </v-list-tile-sub-title>
                                </v-list-tile-content>
                                <v-list-tile-action>
                                    <v-btn @click="addSongToPlaylist(track)" color="primary" flat icon>
                                        <v-icon large>add</v-icon>
                                    </v-btn>
                                </v-list-tile-action>
                            </v-list-tile>
                            <v-divider
                                    :key="index"
                                    v-if="index + 1 < albumSearchDialogData.tracks.length"
                            ></v-divider>
                        </template>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog max-width="700px" persistent scrollable v-model="artistDialog">
            <v-card>
                <v-img :src="artistSearchDialogData.image" class="white--text" height="200px">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex align-end flexbox xs12>
                                <v-btn @click="closeArtistDialog" color="primary" dark icon>
                                    <v-icon>close</v-icon>
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-img>
                <v-card-title class="text-xs-center">
                    <span class="headline">{{artistSearchDialogData.name}}</span>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <span class="title">Top Songs</span>
                    <v-list class="" two-line>
                        <template v-for="(track, index) in artistSearchDialogData.tracks">
                            <v-list-tile :key="track.id" avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>{{ track.name }}</v-list-tile-title>
                                    <v-list-tile-sub-title class="text--primary">{{ track.artist }}
                                    </v-list-tile-sub-title>
                                </v-list-tile-content>
                                <v-list-tile-action>
                                    <v-btn @click="addSongToPlaylist(track)" color="primary" flat icon>
                                        <v-icon large>add</v-icon>
                                    </v-btn>
                                </v-list-tile-action>
                            </v-list-tile>
                            <v-divider
                                    :key="index"
                                    v-if="index + 1 < artistSearchDialogData.tracks.length"
                            ></v-divider>
                        </template>
                    </v-list>
                    <v-divider></v-divider>
                    <p></p>
                    <p class="title">Albums</p>
                    <v-container fluid grid-list-md>
                        <v-layout row wrap>
                            <v-flex :key="album.id" v-for="(album, index) in artistSearchDialogData.albums" xs6>
                                <v-card @click="showAlbumDialog(album)" flat tile>
                                    <v-img :src="album.artwork"></v-img>
                                </v-card>
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <p></p>
                    <p class="title">Singles</p>
                    <v-container fluid grid-list-md>
                        <v-layout row wrap>
                            <v-flex :key="album.id" v-for="(album, index) in artistSearchDialogData.singles" xs6>
                                <v-card @click="showAlbumDialog(album)" flat tile>
                                    <v-img :src="album.artwork"></v-img>
                                </v-card>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-layout align-center justify-center v-if="loading">
            <v-flex class="text-xs-center">
                <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
            </v-flex>
        </v-layout>
        <v-layout align-center justify-center v-if="!loading">
            <v-flex lg6 md8 sm8 xs12>
                <v-flex>
                    <v-layout justify-center>
                        <v-flex class="text-xs-center">
                            <img :src="albumArtwork" class="elevation-20" style="width:100%;max-width: 50vh;"/>
                        </v-flex>
                    </v-layout>
                    <v-layout justify-center>
                        <v-flex class="mt-3">
                            <span class="headline font-weight-medium">{{trackName}}</span>
                            <p class="subheading font-weight-thin font-italic">{{trackArtist}}</p>
                        </v-flex>
                    </v-layout>
                    <v-layout justify-center>
                        <v-flex class="text-xs-center" xs-6>
                            <v-btn @click="voteSkip" color="white" fab flat medium>
                                <v-icon x-large>skip_next</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex class="text-xs-center" xs-6>
                            <v-btn @click="showQueue" color="white" fab flat medium>
                                <v-icon x-large>queue_music</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-flex>
        </v-layout>
        <v-footer class="elevation-20" dark fixed>
            <v-container class="ma-0 pa-2" fluid>
                <v-layout align-center justify-center>
                    <v-flex>
                        <v-progress-linear :color="progressColour" class="my-0" height="7"
                                           v-model="trackPos"></v-progress-linear>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-footer>
        <v-snackbar :timeout="5000" bottom color="secondary" v-model="snackbar">
            {{ snackbarMessage }}
            <v-btn @click="snackbar = false" color="primary" dark flat>
                Close
            </v-btn>
        </v-snackbar>
    </v-container>
</template>

<script>
    import io from 'socket.io-client'
    import session from 'localStorage'
    import * as Vibrant from 'node-vibrant'

    function debounce(func, wait = 100) {
        let timeout
        return function (...args) {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                func.apply(this, args)
            }, wait)
        }
    }

    export default {
        name: "Home",
        props: ['tqueue', 'tadd', 'taddtab'],
        data: () => ({
            socket: null,
            loading: true,
            partyID: null,
            albumArtwork: null,
            trackName: null,
            trackArtist: null,
            trackPos: 0,
            trackLength: 0,
            playing: false,
            progressColour: 'primary',
            progressColourBackground: 'rgba(0,0,0,0)',
            voteSkipDialog: null,
            snackbar: null,
            snackbarMessage: 'Hello',
            voteDialog: null,
            queueDialog: false,
            queue: [],
            fab: null,
            searchDialog: false,
            searchResults: {
                tracks: [],
                artists: [],
                albums: [],
                playlists: []
            },
            searchString: '',
            searchQueue: false,
            isTypingSearch: false,
            searchTabs: null,
            albumDialog: false,
            albumSearchDialogData: {},
            artistDialog: false,
            artistSearchDialogData: {},
        }),
        beforeDestroy() {
            this.socket.disconnect()
        },
        watch: {
            searchString: debounce(function () {
                this.isTypingSearch = false
            }, 500),
            isTypingSearch: function (value) {
                if (!value) {
                    this.search()
                }
            }
        },
        mounted() {
            window.scrollTo(0, 0)
            let t = this
            t.partyID = session.getItem('partyID')

            if (t.tadd !== undefined) {
                t.queueDialog = true
                setTimeout(() => {
                    t.showSearch()
                }, 500)
            } else if (t.tqueue !== undefined) {
                t.queueDialog = true
            }
            t.socket = io(t.$socketPath)
            t.socket.on('connect', () => {
                t.socket.on('disconnect', () => {
                })
                t.socket.emit('start-player-loop', {id: t.partyID})
                t.socket.emit('get-playlist', {id: t.partyID})
            })
            t.eventLoop = setInterval(function () {
                t.socket.emit('get-playlist', {id: t.partyID})
            }, 500)
            t.socket.on('give-playlist', (data) => {
                t.queue = data.playlist
            })
            t.socket.on('event-loop', (data) => {
                if (data) {
                    let d = data.data
                    t.playing = d.is_playing
                    t.trackPos = (d.progress_ms / d.item.duration_ms) * 100
                    t.albumArtwork = d.item.album.images[0].url
                    t.trackName = d.item.name
                    t.trackArtist = d.item.artists.map(e => e.name).reduce((a, b) => {
                        return `${a}${b}, `
                    }, ``).slice(0, -2)
                    if (t.previousTrack !== t.trackName) {
                        t.previousTrack = t.trackName
                        Vibrant.from(t.albumArtwork).getPalette().then(function (palette) {
                            if (palette && palette.DarkVibrant) {
                                t.progressColour = palette.Muted.getHex()
                                t.progressColourBackground = palette.DarkVibrant.getHex()
                            } else {
                                t.progressColour = 'white'
                                t.progressColourBackground = 'rgba(0,0,0,0)'
                            }
                        })
                    }
                    if (this.trackName !== null) {
                        this.loading = false
                    }
                }
            })
            this.socket.on('vote-voted', (data) => {
                if (data.success) {
                    this.snackbarMessage = 'Skip vote has been added'
                } else {
                    this.snackbarMessage = 'You have already voted!'
                }
                this.voteSkipDialog = false

                this.snackbar = true
            })
            this.socket.on('give-search-results', (data) => {
                this.searchResults.tracks = data.tracks.items.map((track) => {
                    return {
                        id: track.id,
                        name: track.name,
                        artwork: track.album.images.find((element) => {
                            return element.height <= 64
                        }).url,
                        artist: track.artists.map(e => e.name).reduce((a, b) => {
                            return `${a}${b}, `
                        }, ``).slice(0, -2)
                    }
                })
                this.searchResults.artists = data.artists.items.map((artist) => {
                    return artist
                })
                this.searchResults.albums = data.albums.items.map((album) => {
                    return {
                        id: album.id,
                        name: album.name,
                        artwork: album.images.find((element) => {
                            return element.height <= 64
                        }).url,
                        artist: album.artists.map(e => e.name).reduce((a, b) => {
                            return `${a}${b}, `
                        }, ``).slice(0, -2)
                    }
                })
                this.searchResults.playlists = data.playlists.items.map((playlist) => {
                    return playlist
                })
            })
            this.socket.on('track-added-success', () => {
                this.snackbarMessage = 'Song added to Queue!'
                this.snackbar = true
            })
            this.socket.on('track-added-duplicate', () => {
                this.snackbarMessage = 'Song already in Queue!'
                this.snackbar = true
            })
            this.socket.on('got-album-data', (data) => {
                this.albumSearchDialogData = {
                    name: data.name,
                    artist: data.artists[0].name,
                    artwork: data.images[0].url,
                    tracks: data.tracks.items.map((track) => {
                        return {
                            id: track.id,
                            name: track.name,
                            artist: track.artists.map(e => e.name).reduce((a, b) => {
                                return `${a}${b}, `
                            }, ``).slice(0, -2)
                        }
                    })
                }
                this.albumDialog = true
            })
            this.socket.on('got-artist-data', (data) => {
                this.artistSearchDialogData = {
                    name: data.general.name,
                    image: (data.general.images.length > 0 ? data.general.images[0].url : ""),
                    tracks: data.top_tracks.tracks.map((track) => {
                        return {
                            id: track.id,
                            name: track.name,
                            artist: track.artists.map(e => e.name).reduce((a, b) => {
                                return `${a}${b}, `
                            }, ``).slice(0, -2)
                        }
                    }),
                    albums: data.albums
                        .map(e => e.name)
                        .map((e, i, final) => final.indexOf(e) === i && i)
                        .filter(e => data.albums[e]).map(e => data.albums[e])
                        .filter((album) => album.album_type === "album")
                        .map((album) => {
                            return {
                                id: album.id,
                                name: album.name,
                                artwork: album.images[0].url,
                                artist: album.artists.map(e => e.name).reduce((a, b) => {
                                    return `${a}${b}, `
                                }, ``).slice(0, -2)
                            }
                        }),
                    singles: data.albums
                        .map(e => e.name)
                        .map((e, i, final) => final.indexOf(e) === i && i)
                        .filter(e => data.albums[e]).map(e => data.albums[e])
                        .filter((album) => album.album_type === "single")
                        .map((album) => {
                            return {
                                id: album.id,
                                name: album.name,
                                artwork: album.images[0].url,
                                artist: album.artists.map(e => e.name).reduce((a, b) => {
                                    return `${a}${b}, `
                                }, ``).slice(0, -2)
                            }
                        }),
                }
                this.artistDialog = true
            })
        },
        methods: {
            songsTab() {
                this.$router.push("/m/home/queue/add/songs")
            },
            albumsTab() {
                this.$router.push("/m/home/queue/add/albums")
            },
            artistsTab() {
                this.$router.push("/m/home/queue/add/artists")
            },
            playlistsTab() {
                this.$router.push("/m/home/queue/add/playlists")
            },
            showSearch() {
                this.searchDialog = true
                this.$router.push("/m/home/queue/add")
            },
            closeSearch() {
                this.searchString = ''
                this.searchResults = []
                this.searchDialog = false
                this.$router.push("/m/home/queue")
            },
            search() {
                if (this.searchString !== "") {
                    this.socket.emit('search', {
                        partyid: this.partyID,
                        searchstring: this.searchString
                    })
                } else {
                    this.searchResults = []
                }
            },
            showQueue() {
                this.queueDialog = true
                this.$router.push("/m/home/queue")
            },
            closeQueue() {
                this.queueDialog = false
                this.$router.push("/m/home")
            },
            showAlbumDialog(album) {
                this.socket.emit('get-album-data', {
                    partyid: this.partyID,
                    album: album.id
                })
            },
            closeAlbumDialog() {
                this.albumDialog = false
                this.albumSearchDialogData = {}
            },
            showArtistDialog(artist) {
                this.socket.emit('get-artist-data', {
                    partyid: this.partyID,
                    artist: artist.id
                })
            },
            closeArtistDialog() {
                this.artistDialog = false
                this.artistSearchDialogData = {}
            },
            nextSong() {
                this.socket.emit('next-song', {
                    id: this.partyID
                })
            },
            toggleplayback() {
                this.socket.emit('toggle-playback', {
                    id: this.partyID,
                    playback: !this.playing
                })
            },
            addSongToPlaylist(track) {
                this.socket.emit('playlist-add-song', {
                    partyid: this.partyID,
                    uuid: session.getItem('uuid'),
                    track: track
                })
            },
            voteSkip() {
                this.socket.emit('vote-skip', {
                    id: this.partyID,
                    uuid: session.getItem('uuid')
                })
            },
            showVoteDialog(track) {
                this.selectedTrack = track.id
                this.voteDialog = true
            },
            upvoteSong() {
                this.socket.emit('playlist-upvote-song', {
                    partyid: this.partyID,
                    track: this.selectedTrack,
                    uuid: session.getItem('uuid')
                })
                this.voteDialog = false
            },
            downvoteSong() {
                this.socket.emit('playlist-downvote-song', {
                    partyid: this.partyID,
                    track: this.selectedTrack,
                    uuid: session.getItem('uuid')
                })
                this.voteDialog = false
            }
        }
    }
</script>
