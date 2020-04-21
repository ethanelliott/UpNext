import { Service } from "typedi";
import { NewPartyDatabaseService } from "./Database/NewPartyDatabaseService";

@Service()
export class NewPartyService {
    constructor(
        private newPartyDatabaseService: NewPartyDatabaseService
    ) {
    }

    public create(partyId: string, state: string) {
        this.newPartyDatabaseService.insert(partyId, state);
    }

    public exists(partyId: string): boolean {
        return this.newPartyDatabaseService.get(partyId) !== null;
    }

    public remove(partyId: string) {
        this.newPartyDatabaseService.delete(partyId);
    }
}
