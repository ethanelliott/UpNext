import { Service } from "typedi";
import db from 'diskdb';
import os from 'os';
import path from 'path';
import fs from 'fs';
import Party from "../Types/Party";
import { plainToClass } from "class-transformer";
import User from "../Types/User";
import PartyPlayState from "../Types/PartyPlayState";
import { PartyStateEnum } from "../Types/PartyStateEnum";
import PlaylistEntry from "../Types/PlaylistEntry";

@Service()
export default class PartyDBService {

    private readonly DATABASE_PATH = path.join(os.homedir(), 'upnext', 'db');
    private readonly DATABASES = ['p'];
    private readonly db: any;

    constructor() {
        if (!fs.existsSync(this.DATABASE_PATH)) {
            fs.mkdirSync(this.DATABASE_PATH, {recursive: true});
        }
        this.db = db.connect(this.DATABASE_PATH, this.DATABASES).p;
    }

    public getAllParties(): Array<Party> {
        return plainToClass(Party, this.db.find()) as any as Array<Party>;
    }

    public findPartyById(id: string): Party {
        return plainToClass(Party, this.db.findOne({id}));
    }

    public newParty(party: Party) {
        this.db.save(party);
    }

    public newUser(partyId: string, user: User) {
        let p = this.findPartyById(partyId);
        if (p) {
            p.users.push(user);
            this.db.update({id: partyId}, p);
        }
    }

    public removeUser(partyId: string, userId: string) {
        let p = this.findPartyById(partyId);
        if (p) {
            let i;
            for (i = 0; i < p.users.length; i++) {
                if (p.users[i].id === userId) {
                    break;
                }
            }
            p.users.splice(i, 1);
            this.db.update({id: partyId}, p);
        }
    }

    public findPartyByCode(code: string): Party {
        return plainToClass(Party, this.db.findOne({code}));
    }

    public refreshPartyToken(partyId: string, accessToken: string, expires: number) {
        let p = this.findPartyById(partyId);
        if (p) {
            p.token = accessToken;
            p.tokenExpire = (new Date()).valueOf() + (1000 * expires);
            this.db.update({id: partyId}, p);
        }
    }

    public updatePartyPlaystate(partyId: string, playState: PartyPlayState) {
        let p = this.findPartyById(partyId);
        if (p) {
            p.playState = playState;
            this.db.update({id: partyId}, p);
        }
    }

    public updatePartyState(partyId: string, partyState: PartyStateEnum) {
        let p = this.findPartyById(partyId);
        if (p) {
            p.state = partyState;
            this.db.update({id: partyId}, p);
        }
    }

    public updatePreviousSong(partyId: string, songId: string) {
        let p = this.findPartyById(partyId);
        if (p) {
            p.previousSong = songId;
            this.db.update({id: partyId}, p);
        }
    }

    public updatePartyPlaylist(partyId: string, playlist: Array<PlaylistEntry>) {
        let p = this.findPartyById(partyId);
        if (p) {
            p.playlist = playlist;
            this.db.update({id: partyId}, p);
        }
    }

    public updatePartyHistory(partyId: string, songId: string) {
        let p = this.findPartyById(partyId);
        if (p) {
            p.history.push(songId);
            if (p.history.length > 5) {
                p.history.shift();
            }
            this.db.update({id: partyId}, p);
        }
    }

    public addPlaylistEntry(partyId: string, playlistEntry: PlaylistEntry) {
        let p = this.findPartyById(partyId);
        if (p) {
            if (!(p.playlist.filter(e => e.id === playlistEntry.id).length > 0)) {
                p.playlist.push(playlistEntry);
                this.db.update({id: partyId}, p);
            } else {
                // The song is already in the playlist...s
                this.upvoteSong(partyId, playlistEntry.id, playlistEntry.added);
            }
        }
    }

    public findUserById(partyId: string, userId: string): User {
        let p = this.findPartyById(partyId);
        if (p) {
            let match = p.users.filter(e => e.id === userId);
            if (match.length === 1) {
                return match[0];
            }
            return null;
        }
        return null;
    }

    public getTokenFromParty(partyId: string): string {
        let p = this.findPartyById(partyId);
        if (p) {
            return p.token;
        } else {
            throw new Error("Unable to find party!");
        }
    }

    public upvoteSong(partyId: string, songId: string, user: User) {
        let p = this.findPartyById(partyId);
        if (p) {
            let entryIndex = p.playlist.findIndex(e => e.id === songId);
            if (entryIndex >= 0 && !(p.playlist[entryIndex].upVoters.filter(e => e.id === user.id).length > 0)) {
                if (p.playlist[entryIndex].downVoters.filter(e => e.id === user.id).length > 0) {
                    p.playlist[entryIndex].downVoters = p.playlist[entryIndex].downVoters.filter(e => e.id !== user.id)
                    p.playlist[entryIndex].votes+=1;
                }
                p.playlist[entryIndex].votes+=1;
                p.playlist[entryIndex].upVoters.push(user);
                this.db.update({id: partyId}, p);
            }
        }
    }

    public downvoteSong(partyId: string, songId: string, user: User) {
        let p = this.findPartyById(partyId);
        if (p) {
            let entryIndex = p.playlist.findIndex(e => e.id === songId);
            if (entryIndex >= 0 && !(p.playlist[entryIndex].downVoters.filter(e => e.id === user.id).length > 0)) {
                if (p.playlist[entryIndex].upVoters.filter(e => e.id === user.id).length > 0) {
                    p.playlist[entryIndex].upVoters = p.playlist[entryIndex].upVoters.filter(e => e.id !== user.id)
                    p.playlist[entryIndex].votes-=1;
                }
                p.playlist[entryIndex].votes-=1;
                p.playlist[entryIndex].downVoters.push(user);
                this.db.update({id: partyId}, p);
            }
        }
    }

    public removePartyBySpotifyUserId(userId: string) {
        this.db.remove({userId});
    }

    public findPartyByUserId(userId: string) {
        return plainToClass(Party, this.db.findOne({userId}));
    }
}
