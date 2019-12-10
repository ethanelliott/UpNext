import SimplifiedTrackObject from "./SimplifiedTrackObject";
import ContextObject from "./ContextObject";

export default class PlayHistoryObject {
    public track: SimplifiedTrackObject;
    public played_at: Object;
    public context: ContextObject;

    public constructor() {
    }
}
