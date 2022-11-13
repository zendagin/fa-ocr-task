
import axios from "axios";
import FormData from "form-data";
import {ObjectLiteral} from "typeorm";
import {AppDataSource} from "../../database/data-source";
import {OcrJob, OcrJobResult, OcrJobStatus} from "../../database/entities/ocr-job";
import {faApiAccessToken, faApiUrl, faApiVersion} from "../../fa-api";
import {startLongPolling} from "./ocr-jobs-cron";

function jobRepo() {return AppDataSource.getRepository(OcrJob);}
function jobResultRepo() {return AppDataSource.getRepository(OcrJobResult);}

type FailibleResponse<T> =
    {success: false, error: {status: number, message?: string, data?: any;};} |
    {success: true, data: T;};

export async function craeteOcrJob(filename: string, buffer: Buffer, sha256: string): Promise<FailibleResponse<ObjectLiteral>> {
    const formData = new FormData();
    formData.append("file", buffer, filename);

    const convertRes = await axios.post(faApiUrl("/convert_to_jpg/async"), formData, {
        headers: {
            ...formData.getHeaders(),
            Authorization: "Bearer " + faApiAccessToken()
        },
    });

    if (convertRes.data.result !== "SUCCESS") {
        return {
            success: false,
            error: {status: 500, message: "Error on converting pdf.", data: convertRes.data}
        };
    }

    const ocrJob = new OcrJob();
    ocrJob.filename = filename;
    ocrJob.sha256 = sha256;
    ocrJob.faApiVersion = faApiVersion();
    ocrJob.faConvertJobId = convertRes.data.data.lid;
    const inserted = await jobRepo().insert(ocrJob);
    startLongPolling();
    return {
        success: true,
        data: inserted.generatedMaps[0]
    };
}

export async function findOcrJob(filename: string, sha256: string) {
    const old = await jobRepo().findOneBy({
        filename,
        sha256,
        faApiVersion: faApiVersion()
    });

    return old;
}

export async function getOcrJob(id: number) {
    return await jobRepo().findOne({
        where: {id},
        relations: {results: true}
    });
}

export async function listOcrJob() {
    return await jobRepo().find({order: {createdAt: "desc"}});
}

export async function checkConvertJobStatus(lid: string): Promise<{done: false;} | {done: true, images: string[];}> {
    const convertRes = await axios.get(faApiUrl(`/convert_to_jpg/${lid}/all`), {
        headers: {
            Authorization: "Bearer " + faApiAccessToken()
        },
    });

    if (convertRes.data.data.status === "processed") {
        return {done: true, images: convertRes.data.data.image};
    } else {
        return {done: false};
    }
}

export async function startOcr(job: OcrJob, images: string[]) {
    const jobResList: OcrJobResult[] = [];
    async function callFaOcrJob(idx: number, imgBase64: string) {
        const buffer = Buffer.from(imgBase64.replace(/^data:.*;base64,/, ""), "base64");

        const form = new FormData();
        form.append("file", buffer, `${job.id}-${idx}.jpg`);
        const res = await axios.post(faApiUrl(`/receipt/async`), form, {
            headers: {
                ...form.getHeaders(),
                Authorization: "Bearer " + faApiAccessToken()
            },
        });

        const lid = res.data.data.lid;

        const jobRes = new OcrJobResult();
        jobRes.lid = lid;
        jobRes.imageIdx = idx;
        jobRes.ocrJob = job;
        jobRes.result = {};
        jobResList.push(jobRes);
    }

    const ps = Array.from(images.entries()).map(([i, imgBase64]) => callFaOcrJob(i, imgBase64));
    await Promise.all(ps);
    await jobResultRepo().insert(jobResList);

    job.pageNum = images.length;
    job.status = OcrJobStatus.OCR;
    return await jobRepo().save(job);
}

export async function checkConvertAndStartOcr(job: OcrJob) {
    const convertStatusResult = await checkConvertJobStatus(job.faConvertJobId);
    if (convertStatusResult.done) {
        const updatedJob = await startOcr(job, convertStatusResult.images);
        return updatedJob;
    } else {
        return job;
    }
}

export async function listJobResults(jobId: number) {
    return jobResultRepo().find({where: {ocrJob: {id: jobId}}});
}

export async function checkConvertingJobsAndStartOcr() {
    const convertingJobs = await jobRepo().find({
        where: {status: OcrJobStatus.CONVERT}
    });
    if (convertingJobs.length) {
        await Promise.all(convertingJobs.map(job => checkConvertAndStartOcr(job)));
    }
}

export async function checkOcrDone() {
    const pending = await jobResultRepo().find({
        where: {done: false},
        relations: {ocrJob: true}
    });
    if (!pending.length) return;

    const ocrDone = new Set<string>();
    async function checkAndUpdateResult(jobRes: OcrJobResult) {
        const receiptRes = await axios.get(faApiUrl(`/receipt/${jobRes.lid}`), {
            headers: {
                Authorization: "Bearer " + faApiAccessToken()
            },
        });

        if (receiptRes.data.data.status === "processed") {
            jobRes.result = receiptRes.data.data.items;
            jobRes.done = true;
            await jobResultRepo().save(jobRes);
        }
    }

    await Promise.all(pending.map(checkAndUpdateResult));

    function jobIds(jobRes: OcrJobResult[]) {
        return new Set(jobRes.map(jr => jr.ocrJob.id));
    }

    const affectedJobIds = jobIds(pending);
    const jobsRemain = jobIds(pending.filter(jobRes => !jobRes.done));
    async function markJobDone(jobId: number) {
        await jobRepo().save({id: jobId, status: OcrJobStatus.DONE});
    }

    const ps: Promise<any>[] = [];
    affectedJobIds.forEach(jobId => {
        if (!jobsRemain.has(jobId)) ps.push(markJobDone(jobId));
    });
    if (ps.length) await Promise.all(ps);
}

export async function checkSingleOcrDone(id: number) {
    const pending = await jobResultRepo().find({
        where: {done: false, ocrJob: {id}}
    });
    if (!pending.length) {
        await setJobDone(id);
        return true;
    }

    for (const job of pending) {
        await checkAndUpdateResult(job);
    }
    // await Promise.all(pending.map(checkAndUpdateResult));

    const jobsRemain = pending.filter(jobRes => !jobRes.done);
    if (!jobsRemain.length) {
        await setJobDone(id);
        return true;
    }
    return false;
}

export async function noPendingJobs() {
    const pending = await jobRepo().find({
        where: [
            {status: OcrJobStatus.CONVERT},
            {status: OcrJobStatus.OCR}
        ]
    });
    return !!pending.length;
}