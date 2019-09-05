export interface PlaylistEntry {
    id: string;
    name: string;
    artist: string;
    artwork: string;
    votes: number;
    added: PlaylistAdded;
    upvoters: Array<string>;
    downvoters: Array<string>;
}

export interface PlaylistAdded {
    uuid: string;
    name: string;
    time: string;
}
