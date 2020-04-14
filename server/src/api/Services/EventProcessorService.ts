import { Service } from "typedi";
import logger from "../../util/Log";
import { EventEmitter } from "events";

class EventProcessorEmitter extends EventEmitter {
}

@Service()
export class EventProcessorService {
    private static readonly maxListener = 500;
    private partyEventProcessors: Map<string, EventProcessorEmitter>;

    constructor() {
        this.partyEventProcessors = new Map<string, EventProcessorEmitter>();
    }

    public newPartyProcessor(partyId: string): void {
        logger.info(`[EPS] Starting new Event Processor ${partyId}`);
        const partyEventEmitter = new EventProcessorEmitter();
        partyEventEmitter.setMaxListeners(EventProcessorService.maxListener);
        this.partyEventProcessors.set(partyId, partyEventEmitter);
    }

    public emitEventAt(partyId: string, event: ProcessorEvents, data: any = null): void {
        logger.info(`[EPS] Emitting event ${event} at ${partyId}`);
        this.partyEventProcessors.get(partyId).emit(event.toString(10), data);
    }

    public addEventHandler(partyId: string, event: ProcessorEvents, method: (data) => void) {
        logger.info(`[EPS] Adding handler for ${event} at ${partyId}`);
        const processorEmitter = this.partyEventProcessors.get(partyId);
        processorEmitter.addListener(event.toString(10), method);
    }
}

export enum ProcessorEvents {
    SEARCH,
    PLAYLIST_ADD_SONG,
    PLAYLIST_REMOVE_SONG,
    PLAYLIST_UPVOTE_SONG,
    PLAYLIST_DOWNVOTE_SONG
}