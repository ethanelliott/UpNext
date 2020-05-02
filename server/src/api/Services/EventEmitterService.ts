import { Service } from "typedi";
import { log } from "../../util/Log";
import { EventEmitter } from "events";
import { PartyEvent, PartyEventHandler, UserEvent, UserEventHandler } from "../Factory/PartyEventEmitterBuilder";

class PartyEventEmitter extends EventEmitter {
}

class UserEventEmitter extends EventEmitter {
}

@Service()
export class EventEmitterService {
    private static readonly maxListener = 500;
    private partyEventEmitters: Map<string, PartyEventEmitter>;
    private userEventEmitters: Map<string, PartyEventEmitter>;

    constructor() {
        this.partyEventEmitters = new Map<string, PartyEventEmitter>();
        this.userEventEmitters = new Map<string, PartyEventEmitter>();
    }

    public newParty(partyId: string): void {
        log.event(`Starting new Event Emitter ${partyId}`);
        const partyEventEmitter = new PartyEventEmitter();
        partyEventEmitter.setMaxListeners(EventEmitterService.maxListener);
        this.partyEventEmitters.set(partyId, partyEventEmitter);
    }

    public emitEventToParty(partyId: string, event: PartyEvent, data: any = null): void {
        log.event(`Emitting event ${event} at ${partyId}`);
        this.partyEventEmitters.get(partyId).emit(event.toString(10), data);
    }

    public joinPartyEvents(partyId: string, eventHandlers: Array<PartyEventHandler>) {
        log.event(`Client joined party ${partyId}`);
        const eventEmitter = this.partyEventEmitters.get(partyId);
        eventHandlers.forEach(e => eventEmitter.on(e.event.toString(10), e.action));
    }

    public leavePartyEvents(partyId: string, eventHandlers: Array<PartyEventHandler>) {
        log.event(`Client left party ${partyId}`);
        const eventEmitter = this.partyEventEmitters.get(partyId);
        eventHandlers.forEach(e => eventEmitter.removeListener(e.event.toString(10), e.action));
    }

    public newUser(userId: string): void {
        log.event(`Starting new Event Emitter ${userId}`);
        const userEventEmitter = new UserEventEmitter();
        userEventEmitter.setMaxListeners(EventEmitterService.maxListener);
        this.userEventEmitters.set(userId, userEventEmitter);
    }

    public emitEventToUser(userId: string, event: UserEvent, data: any = null): void {
        log.event(`Emitting event ${event} to user ${userId}`);
        this.userEventEmitters.get(userId).emit(event.toString(10), data);
    }

    public joinUserEvents(userId: string, eventHandlers: Array<UserEventHandler>) {
        log.event(`Client joined user events ${userId}`);
        const eventEmitter = this.partyEventEmitters.get(userId);
        eventHandlers.forEach(e => eventEmitter.on(e.event.toString(10), e.action));
    }

    public leaveUserEvents(userId: string, eventHandlers: Array<UserEventHandler>) {
        log.event(`Client left user events ${userId}`);
        const eventEmitter = this.partyEventEmitters.get(userId);
        eventHandlers.forEach(e => eventEmitter.removeListener(e.event.toString(10), e.action));
    }
}
