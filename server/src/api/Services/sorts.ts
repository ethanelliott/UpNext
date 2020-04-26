import { PlaylistEntryDB } from "../Types/DatabaseMaps/PlaylistEntryDB";
import { UserDB } from "../Types/DatabaseMaps/UserDB";

export const playlistSort = ($a: PlaylistEntryDB, $b: PlaylistEntryDB) => {
    const n = ($b.UpVotes - $b.DownVotes) - ($a.UpVotes - $a.DownVotes);
    if (n !== 0) return n;
    return $a.addedAt - $b.addedAt;
};

export const userSort = ($a: UserDB, $b: UserDB) => {
    return $b.score - $a.score;
};