import RecommendationSeedObject from "./RecommendationSeedObject";
import SimplifiedTrackObject from "./SimplifiedTrackObject";

export default class RecommendationsResponseObject {
    public seeds: Array<RecommendationSeedObject>;
    public tracks: Array<SimplifiedTrackObject>;

    public constructor() {
    }
}
