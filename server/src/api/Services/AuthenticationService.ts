import { Service } from "typedi";
import WebTokenService from "./WebTokenService";
import logger from "../../util/Log";
import AuthenticationResponse from "../Types/AuthenticationResponse";
import PartyDBService from "./PartyDBService";


@Service()
export default class AuthenticationService {

    constructor(
        private webTokenService: WebTokenService,
        private partyDBService: PartyDBService
    ) {
    }

    public authenticate(token: string): AuthenticationResponse {
        let verification = this.webTokenService.verify(token);
        let p = this.partyDBService.findPartyById(verification.data.partyId);
        if (p) {
            return {valid: !verification.error, data: verification.data};
        } else {
            return {valid: false, data: verification.data};
        }

    }

    public generateToken(partyID: string, userID: string): string {
        try {
            let data = {
                "partyId": partyID,
                "userId": userID
            };
            return this.webTokenService.generateFrom(data);
        } catch (e) {
            logger.error(e.stack);
        }
        return "";
    }
}
