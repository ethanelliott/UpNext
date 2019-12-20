import { Service } from "typedi";
import WebTokenService from "./WebTokenService";
import logger from "../../util/Log";
import UUIDService from "./UUIDService";
import AuthenticationResponse from "../Types/AuthenticationResponse";


@Service()
export default class AuthenticationService {

    constructor(
        private webTokenService: WebTokenService,
        private uuidService: UUIDService
    ) {
    }

    public authenticate(token: string): AuthenticationResponse {
        let verification = this.webTokenService.verify(token);
        // need to add logic for making sure the party still exists... if it doesn't, this will fail
        return {valid: !verification.error, data: verification.data};
    }

    public generateToken(partyID: string): string {
        try {
            let data = {
                "partyId": partyID,
                "userId": this.uuidService.new()
            };
            return this.webTokenService.generateFrom(data);
        } catch (e) {
            logger.error(e.stack);
        }
        return "";
    }
}
