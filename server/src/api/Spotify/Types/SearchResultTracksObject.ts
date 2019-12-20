import PagingObject from "./PagingObject";
import TrackObject from "./TrackObject";

export default class SearchResultTracksObject {
    public tracks: PagingObject<TrackObject>;

    public constructor() {
    }
}
