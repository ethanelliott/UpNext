<template>
    <v-container fluid>
        <v-dialog persistent v-model="loadingOverlay" width="300">
            <v-card color="primary" dark>
                <v-progress-linear class="mb-0" color="white" height="20" indeterminate></v-progress-linear>
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
                            <v-list-tile :key="`${track.id}${index}`" avatar>
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
                            <v-list-tile :key="`${track.id}${index}`" avatar>
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
                                    v-if="index + 1 < artistSearchDialogData.tracks.length"
                            ></v-divider>
                        </template>
                    </v-list>
                    <v-divider></v-divider>
                    <p></p>
                    <p class="title">Albums</p>
                    <v-container fluid grid-list-md>
                        <v-layout row wrap>
                            <v-flex :key="album.id" v-for="(album) in artistSearchDialogData.albums" xs6>
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
                            <v-flex :key="album.id" v-for="(album) in artistSearchDialogData.singles" xs6>
                                <v-card @click="showAlbumDialog(album)" flat tile>
                                    <v-img :src="album.artwork"></v-img>
                                </v-card>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog max-width="700px" persistent scrollable v-model="playlistDialog">
            <v-card>
                <v-card-title class="text-xs-center">
                    <v-btn @click="closePlaylistDialog" dark icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                    <span class="title">{{playlistDialogData.name}}</span>
                </v-card-title>
                <v-card-text>
                    <v-flex>
                        <v-layout justify-center>
                            <v-flex class="text-xs-center">
                                <img :src="playlistDialogData.artwork" class="elevation-20"
                                     style="width:100%;max-width: 25vh;"/>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-divider class="my-3"></v-divider>
                    <v-list class="" two-line>
                        <template v-for="(track, index) in playlistDialogData.tracks">
                            <v-list-tile :key="`${track.id}${index}`" avatar>
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
                                    v-if="index + 1 < playlistDialogData.tracks.length"
                            ></v-divider>
                        </template>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-toolbar dark fixed tabs>
            <v-btn @click="closeSearch" dark icon>
                <v-icon>close</v-icon>
            </v-btn>
            <v-text-field @input="isTypingSearch = true" box clearable label="Search for music here"
                          :loading="searchLoading" v-model="searchString"></v-text-field>
            <template slot="extension">
                <v-tabs color="darker" grow slider-color="primary" v-model="searchTabs">
                    <v-tab @click="songsTab" key="songs">Songs</v-tab>
                    <v-tab @click="albumsTab" key="albums">Albums</v-tab>
                    <v-tab @click="artistsTab" key="artists">Artists</v-tab>
                    <v-tab @click="playlistsTab" key="playlists">Playlists</v-tab>
                </v-tabs>
            </template>
        </v-toolbar>
        <v-flex align-center height="100%" justify-center v-if="searchString.length <= 0">
            <v-flex class="pt-5 text-xs-center">
                <span class="title">Recommendations</span>
                <v-btn @click="refreshRecommendations" fab flat>
                    <v-icon>refresh</v-icon>
                </v-btn>
            </v-flex>
            <v-card flat>
                <v-list class="" two-line>
                    <template v-for="(track, index) in recommendations">
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
        </v-flex>
        <v-flex offset-sm3 sm6 v-else xs12>
            <p class="my-3">&nbsp;</p>
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
                            <template v-for="(playlist, index) in searchResults.playlists">
                                <v-list-tile :key="playlist.id" @click="showPlaylistDialog(playlist)" avatar>
                                    <v-list-tile-avatar tile>
                                        <img :src="playlist.artwork">
                                    </v-list-tile-avatar>
                                    <v-list-tile-content>
                                        <v-list-tile-title>{{ playlist.name }}</v-list-tile-title>
                                        <v-list-tile-sub-title class="text--primary">{{ playlist.owner }}
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
        </v-flex>
        <v-snackbar :timeout="5000" bottom color="secondary" v-model="snackbar">
            {{ snackbarMessage }}
            <v-btn @click="snackbar = false" color="primary" dark flat>
                Close
            </v-btn>
        </v-snackbar>
        <v-snackbar :timeout="5000" bottom color="secondary" v-model="addSongSnackbar">
            {{ addSongSnackbarMessage }}
            <v-btn @click="undoSongAdd" color="primary" dark flat>
                Undo
            </v-btn>
        </v-snackbar>
    </v-container>
</template>

<script>
    import io from 'socket.io-client'
    import session from 'localStorage'

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
        name: "Search",
        data: () => ({
            socket: null,
            loading: true,
            partyID: null,
            defaultAlbumArtwork: "https://discussions.apple.com/content/attachment/881765040",
            snackbar: null,
            snackbarMessage: 'Hello',
            undoSongTempHistory: null,
            addSongSnackbar: null,
            addSongSnackbarMessage: '',
            searchDialog: false,
            searchResults: {
                tracks: [],
                artists: [],
                albums: [],
                playlists: []
            },
            searchLoading: false,
            searchString: '',
            searchQueue: false,
            isTypingSearch: false,
            searchTabs: null,
            albumDialog: false,
            albumSearchDialogData: {},
            artistDialog: false,
            artistSearchDialogData: {},
            playlistDialog: false,
            playlistDialogData: {},
            loadingOverlay: false,
            recommendations: []
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
            t.undoSongTempHistory = null
            t.partyID = session.getItem('partyID')
            t.socket = io(t.$socketPath)
            t.socket.on('connect', () => {
                t.socket.emit('get-recommendations', {
                    partyid: t.partyID,
                })
                t.socket.on('disconnect', () => {
                })
            })
            this.socket.on('give-search-results', (data) => {
                this.searchLoading = false
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
                    return {
                        id: playlist.id,
                        name: playlist.name,
                        owner: playlist.owner.display_name,
                        artwork: playlist.images[0].url
                    }
                })
            })
            this.socket.on('got-recommendations', (data) => {
                this.recommendations = data.tracks.map((track) => {
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
            })
            this.socket.on('track-added-success', () => {
                this.addSongSnackbarMessage = 'Song added to Queue!'
                this.addSongSnackbar = true
            })
            this.socket.on('track-added-duplicate', () => {
                this.snackbarMessage = 'Song already in Queue!'
                this.snackbar = true
            })
            this.socket.on('got-album-data', (data) => {
                this.stopLoading()
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
                this.stopLoading()
                this.artistSearchDialogData = {
                    name: data.general.name,
                    image: (data.general.images.length > 0 ? data.general.images[0].url : ""),
                    tracks: data.top_tracks.tracks.map((track) => {
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
            this.socket.on('got-playlist-data', (data) => {
                this.stopLoading()
                this.playlistDialogData = {
                    name: data.general.name,
                    owner: data.general.owner.display_name,
                    artwork: data.general.images[0].url,
                    tracks: data.tracks
                        .filter((track) => track.is_local === false && track.track.available_markets.length > 0)
                        .map((track) => {
                            return {
                                id: track.track.id,
                                name: track.track.name,
                                artwork: track.track.album.images.find((element) => {
                                    return element.height <= 64
                                }).url,
                                artist: track.track.artists.map(e => e.name).reduce((a, b) => {
                                    return `${a}${b}, `
                                }, ``).slice(0, -2)
                            }
                        })
                }
                this.playlistDialog = true
            })
        },
        methods: {
            startLoading() {
                this.loadingOverlay = true
            },
            stopLoading() {
                this.loadingOverlay = false
            },
            songsTab() {

            },
            albumsTab() {

            },
            artistsTab() {

            },
            playlistsTab() {

            },
            closeSearch() {
                this.searchString = ''
                this.searchResults = []
                this.searchDialog = false
                this.$router.push("/m/home/queue")
            },
            search() {
                if (this.searchString !== "") {
                    this.searchLoading = true
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
                this.startLoading()
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
                this.startLoading()
                this.socket.emit('get-artist-data', {
                    partyid: this.partyID,
                    artist: artist.id
                })
            },
            closeArtistDialog() {
                this.artistDialog = false
                this.artistSearchDialogData = {}
            },
            showPlaylistDialog(playlist) {
                this.startLoading()
                this.socket.emit('get-playlist-data', {
                    partyid: this.partyID,
                    playlist: playlist.id
                })
            },
            closePlaylistDialog() {
                this.playlistDialog = false
                this.playlistDialogData = {}
            },
            addSongToPlaylist(track) {
                this.undoSongTempHistory = track
                this.socket.emit('playlist-add-song', {
                    partyid: this.partyID,
                    uuid: session.getItem('uuid'),
                    track: track
                })
            },
            undoSongAdd() {
                this.socket.emit('playlist-undo-add-song', {
                    partyid: this.partyID,
                    uuid: session.getItem('uuid'),
                    track: this.undoSongTempHistory
                })
                this.undoSongTempHistory = null
                this.addSongSnackbar = false
            },
            refreshRecommendations() {
                this.socket.emit('get-recommendations', {
                    partyid: this.partyID,
                })
            }
        }
    }
</script>

<style>
    .back-style {
        background-image: linear-gradient(rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%);
    }
</style>
