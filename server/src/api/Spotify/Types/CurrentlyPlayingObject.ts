import DeviceObject from "./DeviceObject";
import ContextObject from "./ContextObject";
import TrackObject from "./TrackObject";

export default class CurrentlyPlayingObject {
    public device: DeviceObject;
    public repeat_state: string;
    public shuffle_state: boolean;
    public context: ContextObject;
    public timestamp: number;
    public progress_ms: number;
    public is_playing: boolean;
    public item: TrackObject;
    public currently_playing_type: string;
    public actions: Object;

    public constructor() {
    }
}
