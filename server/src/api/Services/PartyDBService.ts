import { Service } from "typedi";
import db from 'diskdb';
import os from 'os';
import path from 'path';
import fs from 'fs';
import Party from "../Types/Party";
import { plainToClass } from "class-transformer";
import User from "../Types/User";

@Service()
export default class PartyDBService {

    private readonly DATABASE_PATH = path.join(os.homedir(), 'upnext', 'db');
    private readonly DATABASES = ['p'];
    private readonly db: any;

    constructor() {
        if (!fs.existsSync(this.DATABASE_PATH)) {
            fs.mkdirSync(this.DATABASE_PATH, {recursive: true});
        }
        this.db = db.connect(this.DATABASE_PATH, this.DATABASES).p;
    }

    public getAllParties(): Array<Party> {
        return plainToClass(Party, this.db.find()) as any as Array<Party>;
    }

    public findPartyById(id: string): Party {
        return plainToClass(Party, this.db.findOne({id}));
    }

    public newParty(party: Party) {
        this.db.save(party);
    }

    public newUser(partyId: string, user: User) {
        let p = this.findPartyById(partyId);
        if (p) {
            p.users.push(user);
            this.db.update({id: partyId}, p);
        }
    }

    public removeUser(partyId: string, userId: string) {
        let p = this.findPartyById(partyId);
        if (p) {
            let i;
            for (i = 0; i < p.users.length; i++) {
                if (p.users[i].id === userId) {
                    break;
                }
            }
            p.users.splice(i, 1);
            this.db.update({id: partyId}, p);
        }
    }

    public findPartyByCode(code: string): Party {
        return plainToClass(Party, this.db.findOne({code}));
    }
}
