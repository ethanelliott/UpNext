import { Service } from "typedi";
import db from 'diskdb';
import os from 'os';
import path from 'path';
import fs from 'fs';

@Service()
export default class CreatingPartyDBService {

    private readonly DATABASE_PATH = path.join(os.homedir(), 'upnext', 'db');
    private readonly DATABASES = ['new'];
    private readonly db: any;

    constructor() {
        if (!fs.existsSync(this.DATABASE_PATH)) {
            fs.mkdirSync(this.DATABASE_PATH, {recursive: true});
        }
        this.db = db.connect(this.DATABASE_PATH, this.DATABASES).new;
    }

    public getAllCreatingParties() {
        return this.db.find();
    }

    public new(pid: string, webToken: string): void {
        this.db.save({
            pid,
            token: webToken
        })
    }

    public exists(pid: string): boolean {
        return this.db.find({pid}).length > 0;
    }

    public remove(pid: string) {
        this.db.remove({pid});
    }
}
