import { Service } from "typedi";
import { WebTokenService } from "./WebTokenService";
import logger from "../../util/Log";
import WebTokenData from "../Types/general/WebTokenData";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";


@Service()
export class AuthenticationService {

    constructor(
        private webTokenService: WebTokenService,
        private partyDatabaseService: PartyDatabaseService,
    ) {
    }

    public authenticate(token: string): Promise<WebTokenData> {
        return new Promise((resolve, reject) => {
            const verification = this.webTokenService.verify<WebTokenData>(token);
            if (verification.error) {
                reject("Invalid token");
            } else {
                if (this.partyDatabaseService.doesPartyExistById(verification.data.partyId)) {
                    resolve(verification.data);
                } else {
                    reject("Party doesn't exist!");
                }
            }
        });
    }

    public generateToken(partyId: string, userId: string, admin: boolean): string {
        try {
            let data = {
                partyId,
                userId,
                admin
            };
            return this.webTokenService.generateFrom(data);
        } catch (e) {
            logger.error(e.stack);
            return "";
        }
    }
}
