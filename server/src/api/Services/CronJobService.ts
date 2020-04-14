import { Service } from "typedi";

import cron from 'node-cron';
import UUIDService from "./UUIDService";
import logger from "../../util/Log";

@Service()
export class CronJobService {

    private cronJobs: Map<string, CronJob>;

    constructor(
        private uuidService: UUIDService
    ) {
        this.cronJobs = new Map<string, CronJob>();
    }

    public newCronJob(cronJob: CronJob) {
        const cronJobId = this.uuidService.new();
        this.cronJobs.set(cronJobId, cronJob);
        cron.schedule(cronJob.pattern, () => {
            logger.debug(`[CRON] Running job: ${cronJobId}`);
            cronJob.method();
        });

    }
}

class CronJob {
    method: Function;
    pattern: string;
}