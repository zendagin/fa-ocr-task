
import schedule from "node-schedule";
import {checkConvertingJobsAndStartOcr} from "./ocr-jobs-services";

export function initOcrJobsCron() {
    // every 15 mins
    schedule.scheduleJob("*/15 * * * *", async () => {
        checkConvertingJobsAndStartOcr();
    });
}