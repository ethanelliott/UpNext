import { PartyEventHandlerBuilder, UserEventHandlerBuilder } from "./PartyEventHandlerBuilder";

export class PartyEventEmitterBuilder {

    private readonly eventMap: Map<PartyEvent, { action: (data: any) => any, socketId: string }>;

    constructor() {
        this.eventMap = new Map<PartyEvent, { action: (data: any) => any, socketId: string }>();
    }

    public static make(): PartyEventEmitterBuilder {
        return new PartyEventEmitterBuilder();
    }

    public withEvent(eventName: PartyEvent, action: (data: any) => any, socketId: string): PartyEventEmitterBuilder {
        this.eventMap.set(eventName, {action, socketId});
        return this;
    }

    public build(): Array<PartyEventHandler> {
        const eventArray: Array<PartyEventHandler> = new Array<PartyEventHandler>();
        this.eventMap.forEach(({action, socketId}, eventName) => {
            eventArray.push(PartyEventHandlerBuilder
                .make()
                .withEvent(eventName)
                .withAction(action)
                .withSocketId(socketId)
                .build());
        });
        return eventArray;
    }
}

export class UserEventEmitterBuilder {

    private readonly eventMap: Map<UserEvent, { action: (data: any) => any, socketId: string }>;

    constructor() {
        this.eventMap = new Map<UserEvent, { action: (data: any) => any, socketId: string }>();
    }

    public static make(): UserEventEmitterBuilder {
        return new UserEventEmitterBuilder();
    }

    public withEvent(eventName: UserEvent, action: (data: any) => any, socketId: string): UserEventEmitterBuilder {
        this.eventMap.set(eventName, {action, socketId});
        return this;
    }

    public build(): Array<UserEventHandler> {
        const eventArray: Array<UserEventHandler> = new Array<UserEventHandler>();
        this.eventMap.forEach(({action, socketId}, eventName) => {
            eventArray.push(UserEventHandlerBuilder
                .make()
                .withEvent(eventName)
                .withAction(action)
                .withSocketId(socketId)
                .build());
        });
        return eventArray;
    }
}

export class PartyEventHandler {
    public event: PartyEvent;
    public action: (data: any) => any;
    public socketId: string;
}

export class UserEventHandler {
    public event: UserEvent;
    public action: (data: any) => any;
    public socketId: string;
}

export enum PartyEvent {
    PARTY_GONE,
    STATE_CHANGE,
    PLAYLIST_UPDATE,
    USERS_UPDATE,
    NOTIFICATION
}

export enum UserEvent {
    NOTIFICATION
}