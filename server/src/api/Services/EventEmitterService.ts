import { Service } from "typedi";
import logger from "../../util/Log";
import { EventEmitter } from "events";
import { PartyEvent, PartyEventHandler } from "../Factory/PartyEventEmitterBuilder";

class PartyEventEmitter extends EventEmitter {
}

@Service()
export class EventEmitterService {
    private static readonly maxListener = 500;
    private partyEventEmitters: Map<string, PartyEventEmitter>;

    constructor() {
        this.partyEventEmitters = new Map<string, PartyEventEmitter>();
    }

    public newParty(partyId: string): void {
        logger.info(`[PEE] Starting new Event Emitter ${partyId}`);
        const partyEventEmitter = new PartyEventEmitter();
        partyEventEmitter.setMaxListeners(EventEmitterService.maxListener);
        this.partyEventEmitters.set(partyId, partyEventEmitter);
    }

    public emitEventAt(partyId: string, event: PartyEvent, data: any = null): void {
        logger.info(`[PEE] Emitting event ${event} at ${partyId}`);
        this.partyEventEmitters.get(partyId).emit(event.toString(10), data);
    }

    public joinPartyEvents(partyId: string, eventHandlers: Array<PartyEventHandler>) {
        logger.info(`[PEE] Client joined party ${partyId}`);
        const eventEmitter = this.partyEventEmitters.get(partyId);
        eventHandlers.forEach(e => eventEmitter.on(e.event.toString(10), e.action));
    }

}
