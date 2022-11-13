
import schedule from "node-schedule";
import {checkConvertingJobsAndStartOcr, checkOcrDone, noPendingJobs} from "./ocr-jobs-services";

let longPoll = false;
let lock = false;

export function startLongPolling() {
    longPoll = true;
}

export function initOcrJobsCron() {
    noPendingJobs().then(penging => longPoll = penging);
    schedule.scheduleJob("*/3 * * * * *", async () => {
        if (!lock && longPoll) {
            lock = true;
            await checkConvertingJobsAndStartOcr().then();
            await checkOcrDone().then();
            longPoll = await noPendingJobs();
            lock = false;
        }
    });
}
