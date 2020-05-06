import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { log } from "../util/Log";
import { Container } from "typedi";
import { DatabaseService } from "../api/Services/Database/DatabaseService";
import { NewPartyDatabaseService } from "../api/Services/Database/NewPartyDatabaseService";
import { PartyDatabaseService } from "../api/Services/Database/PartyDatabaseService";
import { PlaylistEntryDatabaseService } from "../api/Services/Database/PlaylistEntryDatabaseService";
import { PlaylistVoteDatabaseService } from "../api/Services/Database/PlaylistVoteDatabaseService";
import { UserDatabaseService } from "../api/Services/Database/UserDatabaseService";
import { PartyHistoryDatabaseService } from "../api/Services/Database/PartyHistoryDatabaseService";
import { UserPermissionDatabaseService } from "../api/Services/Database/UserPermissionDatabaseService";
import { UserTrackerDatabaseService } from "../api/Services/Database/UserTrackerDatabaseService";
import { AppUpdatesDatabaseService } from "../api/Services/Database/AppUpdatesDatabaseService";
import { AdminUserDatabaseService } from "../api/Services/Database/AdminUserDatabaseService";

export const DatabaseLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        log.startup(`Loading Databases`);
        Container.get(DatabaseService);
        Container.get(UserPermissionDatabaseService);
        Container.get(NewPartyDatabaseService);
        Container.get(PartyDatabaseService);
        Container.get(PartyHistoryDatabaseService);
        Container.get(PlaylistEntryDatabaseService);
        Container.get(PlaylistVoteDatabaseService);
        Container.get(UserDatabaseService);
        Container.get(UserTrackerDatabaseService);
        Container.get(AppUpdatesDatabaseService);
        Container.get(AdminUserDatabaseService);
    }
};
