import PublicUserObject from "./PublicUserObject";
import TrackObject from "./TrackObject";

export default class PlaylistTrackObject {
    public added_at: Object;
    public added_by: PublicUserObject;
    public is_local: boolean;
    public track: TrackObject;

    public constructor() {
    }
}
