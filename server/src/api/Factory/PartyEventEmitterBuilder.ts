import { PartyEventHandlerBuilder } from "./PartyEventHandlerBuilder";

export class PartyEventEmitterBuilder {

    private readonly eventMap: Map<PartyEvent, (data: any) => any>;

    constructor() {
        this.eventMap = new Map<PartyEvent, (data: any) => any>();
    }

    public static make(): PartyEventEmitterBuilder {
        return new PartyEventEmitterBuilder();
    }

    public withEvent(eventName: PartyEvent, action: (data: any) => any): PartyEventEmitterBuilder {
        this.eventMap.set(eventName, action);
        return this;
    }

    public build(): Array<PartyEventHandler> {
        const eventArray: Array<PartyEventHandler> = new Array<PartyEventHandler>();
        this.eventMap.forEach((action, eventName) => {
            eventArray.push(PartyEventHandlerBuilder
                .make()
                .withEvent(eventName)
                .withAction(action)
                .build());
        });
        return eventArray;
    }
}

export class PartyEventHandler {
    public event: PartyEvent;
    public action: (data: any) => any;
}

export enum PartyEvent {
    PARTY_GONE,
    STATE_CHANGE,
    PLAYLIST_UPDATE,
    USERS_UPDATE
}