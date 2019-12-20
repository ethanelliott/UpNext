import { Service } from "typedi";
import uuid from 'uuid/v3';


@Service()
export default class UUIDService {
    private readonly domain: string;

    constructor() {
        this.domain = 'https://upnext.cool';
    }

    public new(): string {
        return uuid(this.domain, uuid.URL);
    }
}
