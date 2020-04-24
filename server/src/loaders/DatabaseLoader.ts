import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import logger from "../util/Log";
import { Container } from "typedi";
import { DatabaseService } from "../api/Services/Database/DatabaseService";
import { NewPartyDatabaseService } from "../api/Services/Database/NewPartyDatabaseService";
import { PartyDatabaseService } from "../api/Services/Database/PartyDatabaseService";
import { PlaylistEntryDatabaseService } from "../api/Services/Database/PlaylistEntryDatabaseService";
import { PlaylistVoteDatabaseService } from "../api/Services/Database/PlaylistVoteDatabaseService";
import { UserDatabaseService } from "../api/Services/Database/UserDatabaseService";
import { PartyHistoryDatabaseService } from "../api/Services/Database/PartyHistoryDatabaseService";
import { UserPermissionDatabaseService } from "../api/Services/Database/UserPermissionDatabaseService";

export const DatabaseLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading Databases");
        Container.get(DatabaseService);
        Container.get(UserPermissionDatabaseService);
        Container.get(NewPartyDatabaseService);
        Container.get(PartyDatabaseService);
        Container.get(PartyHistoryDatabaseService);
        Container.get(PlaylistEntryDatabaseService);
        Container.get(PlaylistVoteDatabaseService);
        Container.get(UserDatabaseService);
    }
};
