import { PartyStateEnum } from "../Enums/PartyStateEnum";

export class PartyStateDB {
    id: string;
    partyId: string;
    state: PartyStateEnum;
    previousTrackId: string;
    trackId: string;
    trackName: string;
    artistName: string;
    progress: number;
    duration: number;
    albumArtwork: string;
    addedBy: string;
    colourVibrant: string;
    colourMuted: string;
    colourDarkVibrant: string;
    colourDarkMuted: string;
    colourLightVibrant: string;
    colourLightMuted: string;
}
