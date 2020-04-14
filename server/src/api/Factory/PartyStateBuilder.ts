import { PartyStateDB } from "../Types/DatabaseMaps/PartyStateDB";
import { PartyStateEnum } from "../Types/Enums/PartyStateEnum";

export class PartyStateBuilder {

    private id: string;
    private partyId: string;
    private state: PartyStateEnum = PartyStateEnum.NOTHING_PLAYING;
    // private previousTrackId: string;
    // private trackId: string;
    // private trackName: string;
    // private artistName: string;
    // private progress: number;
    // private duration: number;
    // private albumArtwork: string;
    // private addedBy: string;
    // private colourVibrant: string;
    // private colourMuted: string;
    // private colourDarkVibrant: string;
    // private colourDarkMuted: string;
    // private colourLightVibrant: string;
    // private colourLightMuted: string;

    constructor() {
    }


    public static make(): PartyStateBuilder {
        return new PartyStateBuilder();
    }

    public withId(id: string): PartyStateBuilder {
        this.id = id;
        return this;
    }

    public withPartyId(partyId: string): PartyStateBuilder {
        this.partyId = partyId;
        return this;
    }

    public build(): PartyStateDB {
        let p = new PartyStateDB();
        p.id = this.id;
        p.partyId = this.partyId;
        p.state = this.state;
        p.previousTrackId = '';
        p.trackId = '';
        p.trackName = '';
        p.artistName = '';
        p.progress = 0;
        p.duration = 0;
        p.albumArtwork = '';
        p.addedBy = '';
        p.colourVibrant = '';
        p.colourMuted = '';
        p.colourDarkVibrant = '';
        p.colourDarkMuted = '';
        p.colourLightVibrant = '';
        p.colourLightMuted = '';
        return p;
    }

}
