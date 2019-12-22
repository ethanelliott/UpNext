import 'reflect-metadata';
import { JsonController, Post } from 'routing-controllers';
import PartyDBService from "../Services/PartyDBService";
import CreatingPartyDBService from "../Services/CreatingPartyDBService";

@JsonController('/new')
export class CreatingPartyController {
    constructor(
        private partyDBService: PartyDBService,
        private creatingPartyDBService: CreatingPartyDBService
    ) {
    }

    @Post('/new')
    public makeNewParty(): any {
        let x = this.creatingPartyDBService.getAllCreatingParties();
        let y = this.partyDBService.getAllParties();
        return {x, y};
    }
}
