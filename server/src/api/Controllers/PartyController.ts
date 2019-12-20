import 'reflect-metadata';
import { Get, JsonController, Post } from 'routing-controllers';
import SpotifyAPI from "../Spotify/SpotifyAPI";

@JsonController('/party')
export class PartyController {
    constructor() {
    }

    @Post('/new')
    public makeNewParty(): any {
        return null;
    }

    @Post('/auth')
    public authenticatePartyCode(): any {
        return null;
    }

    @Post('/leave')
    public leaveParty(): any {
        return null;
    }

    @Get('/test/:id')
    public async test(): Promise<any> {
        // not sure why this was in the old code
        let s = new SpotifyAPI();
        let al = await s.browse.getFeaturedPlaylists("BQBgJmCYvtCzHPJwNosiy8NnMshN7LgyCBJV5rfAF1Re5rKR0GAOIKf5JXMTIWgxxRYHXV-OgUfjaRU7HyH0lXg5VWtBcTeJQ4sVhFDn_rUz3yEunDZhNQ4-FZ4SYBY9sAXFkGz0vSAAjgpBXT_04G64bMQvkUShzHDUKUZYVUlXflvbDy2574594AnlP3v8Es9Bh5wXqdTTzLApf0oSHj7vHI8NiEyX-QVuWWGH0uDiduwYQtofNhF1sl7V");
        return al.message;
    }
}
