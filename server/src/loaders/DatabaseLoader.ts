import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { log } from "../util/Log";
import { Container } from "typedi";
import { DatabaseService } from "../api/Services/Database/DatabaseService";
import { PartyDatabaseService } from "../api/Services/Database/PartyDatabaseService";
import { UserPermissionDatabaseService } from "../api/Services/Database/UserPermissionDatabaseService";
import { NewPartyDatabaseService } from "../api/Services/Database/NewPartyDatabaseService";
import { PartyHistoryDatabaseService } from "../api/Services/Database/PartyHistoryDatabaseService";
import { PlaylistEntryDatabaseService } from "../api/Services/Database/PlaylistEntryDatabaseService";
import { UserDatabaseService } from "../api/Services/Database/UserDatabaseService";
import { UserTrackerDatabaseService } from "../api/Services/Database/UserTrackerDatabaseService";
import { PlaylistVoteDatabaseService } from "../api/Services/Database/PlaylistVoteDatabaseService";
import { AppUpdatesDatabaseService } from "../api/Services/Database/AppUpdatesDatabaseService";
import { AdminUserDatabaseService } from "../api/Services/Database/AdminUserDatabaseService";

export const DatabaseLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        log.startup(`Loading Database Service`);
        await Container.get(DatabaseService).connect();
        log.startup(`Loading Databases...`);
        await Container.get(PartyDatabaseService).connect();
        await Container.get(UserPermissionDatabaseService).connect();
        await Container.get(UserTrackerDatabaseService).connect();
        await Container.get(UserDatabaseService).connect();
        await Container.get(NewPartyDatabaseService).connect();
        await Container.get(PartyHistoryDatabaseService).connect();
        await Container.get(PlaylistEntryDatabaseService).connect();
        await Container.get(PlaylistVoteDatabaseService).connect();
        await Container.get(AppUpdatesDatabaseService).connect();
        await Container.get(AdminUserDatabaseService).connect();
        log.startup(`Databases Loaded`);
    }
};
