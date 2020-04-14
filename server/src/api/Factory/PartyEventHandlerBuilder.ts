import { PartyEvent, PartyEventHandler } from "./PartyEventEmitterBuilder";

export class PartyEventHandlerBuilder {
    private eventName: PartyEvent;
    private action: (data: any) => any;

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

    public build(): PartyEventHandler {
        const p = new PartyEventHandler();
        p.event = this.eventName;
        p.action = this.action;
        return p;
    }
}