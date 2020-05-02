import { PartyEvent, PartyEventHandler, UserEvent, UserEventHandler } from "./PartyEventEmitterBuilder";

export class PartyEventHandlerBuilder {
    private eventName: PartyEvent;
    private action: (data: any) => any;
    private socketId: string;

    constructor() {
    }

    public static make(): PartyEventHandlerBuilder {
        return new PartyEventHandlerBuilder();
    }

    public withEvent(eventName: PartyEvent): PartyEventHandlerBuilder {
        this.eventName = eventName;
        return this;
    }

    public withAction(action: (data: any) => any): PartyEventHandlerBuilder {
        this.action = action;
        return this;
    }

    public withSocketId(socketId: string): PartyEventHandlerBuilder {
        this.socketId = socketId;
        return this;
    }

    public build(): PartyEventHandler {
        const p = new PartyEventHandler();
        p.event = this.eventName;
        p.action = this.action;
        p.socketId = this.socketId;
        return p;
    }
}

export class UserEventHandlerBuilder {
    private eventName: UserEvent;
    private action: (data: any) => any;
    private socketId: string;

    constructor() {
    }

    public static make(): UserEventHandlerBuilder {
        return new UserEventHandlerBuilder();
    }

    public withEvent(eventName: UserEvent): UserEventHandlerBuilder {
        this.eventName = eventName;
        return this;
    }

    public withAction(action: (data: any) => any): UserEventHandlerBuilder {
        this.action = action;
        return this;
    }

    public withSocketId(socketId: string): UserEventHandlerBuilder {
        this.socketId = socketId;
        return this;
    }

    public build(): UserEventHandler {
        const p = new UserEventHandler();
        p.event = this.eventName;
        p.action = this.action;
        p.socketId = this.socketId;
        return p;
    }
}