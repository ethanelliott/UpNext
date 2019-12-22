import PagingObject from "./PagingObject";
import ArtistObject from "./ArtistObject";

export default class SearchResultArtistsObject {
    public artists: PagingObject<ArtistObject>;

    public constructor() {
    }
}
