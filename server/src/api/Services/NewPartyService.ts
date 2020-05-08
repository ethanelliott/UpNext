import { Service } from "typedi";
import { NewPartyDatabaseService } from "./Database/NewPartyDatabaseService";

@Service()
export class NewPartyService {
    constructor(
        private newPartyDatabaseService: NewPartyDatabaseService
    ) {
    }

    public async create(partyId: string, state: string) {
        await this.newPartyDatabaseService.insert(partyId, state);
    }

    public async exists(partyId: string): Promise<boolean> {
        return await this.newPartyDatabaseService.get(partyId) !== null;
    }

    public async remove(partyId: string) {
        await this.newPartyDatabaseService.delete(partyId);
    }
}
