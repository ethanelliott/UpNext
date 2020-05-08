import 'reflect-metadata';
import { Get, JsonController } from 'routing-controllers';
import { AppUpdatesDatabaseService } from "../Services/Database/AppUpdatesDatabaseService";
import { UpdateDB } from "../Types/DatabaseMaps/UpdateDB";

@JsonController('/app')
export class AppController {
    constructor(
        private appUpdatesDatabaseService: AppUpdatesDatabaseService
    ) {
    }

    @Get('/updates')
    public async updates(): Promise<Array<UpdateDB>> {
        return await this.appUpdatesDatabaseService.getAllUpdates();
    }
}
