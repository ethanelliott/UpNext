import { PlaylistVoteEnum } from "../Enums/PlaylistVoteEnum";

export class PlaylistVotesDB {
    userId: string;
    playlistEntryId: string;
    type: PlaylistVoteEnum;
}
