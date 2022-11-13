import crypto from "crypto";
import {RequestHandler} from "express";
import {OcrJobStatus} from "../../database/entities/ocr-job";
import {checkConvertAndStartOcr, checkConvertingJobsAndStartOcr, checkOcrDone, checkSingleOcrDone, craeteOcrJob, findOcrJob, getOcrJob, listOcrJob} from "./ocr-jobs-services";

export const createOcrJobHandler: RequestHandler = async (req, res) => {
    if (!req.file) {
        res.status(400).json({message: `File not found.`});
        return;
    }

    const {
        originalname,
        buffer,
        mimetype
    } = req.file;

    if (mimetype !== "application/pdf") {
        res.status(400).json({message: `Only accept pdf file`});
        return;
    }

    const sha256 = crypto.createHash("sha256").update(buffer).digest("base64");

    const oldJob = await findOcrJob(originalname, sha256);

    if (!!oldJob) {
        res.json({ocrJob: oldJob});
        return;
    }

    const createResult = await craeteOcrJob(originalname, buffer, sha256);
    if (createResult.success) {
        res.json({ocrJob: await getOcrJob(createResult.data.id)});
    } else {
        const {error} = createResult;
        res.status(error.status).json({message: error.message, data: error.data});
    }
};

export const getOcrJobHandler: RequestHandler = async (req, res) => {
    const id = req.params.jobId;
    const job = await getOcrJob(Number(id));

    if (!job) {
        res.status(404).json({message: `Job ${id} not found.`});
        return;
    }

    switch (job.status) {
        case OcrJobStatus.CONVERT:
            const checkedJob = await checkConvertAndStartOcr(job);
            res.json({ocrJob: checkedJob});
            break;

        case OcrJobStatus.OCR:
            const changed = await checkSingleOcrDone(job.id);
            if (changed)
                res.json({ocrJob: await getOcrJob(job.id)});
            else
                res.json({ocrJob: job});
            break;

        case OcrJobStatus.DONE:
        case OcrJobStatus.ERROR:
            res.json({ocrJob: job});
            break;
    }
};

export const listOcrJobsHandler: RequestHandler = async (req, res) => {
    await Promise.all([
        checkConvertingJobsAndStartOcr(),
        checkOcrDone()
    ]);
    res.json({ocrJobs: await listOcrJob()});
};