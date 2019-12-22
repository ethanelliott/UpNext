import ImageObject from "../Spotify/Types/ImageObject";

export default class PartyPlayState {
    isPlaying: boolean;
    trackId: string;
    trackName: string;
    albumName: string;
    artistName: string;
    progress: number;
    duration: number;
    albumArtwork: Array<ImageObject>;
}
