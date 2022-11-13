import crypto from "crypto";
import {RequestHandler} from "express";
import {AppDataSource} from "../../database/data-source";
import {OcrJob} from "../../database/entities/ocr-job";
import {craeteOcrJob, findOcrJob, getOcrJob, listOcrJob} from "./ocr-jobs-services";

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
        res.json({job: oldJob});
        return;
    }

    const createResult = await craeteOcrJob(originalname, buffer, sha256);
    if (createResult.success) {
        res.json({job: createResult.data});
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
    } else {
        res.json({ocrJob: job});
    }
};

export const listOcrJobsHandler: RequestHandler = async (req, res) => {
    res.json({ocrJobs: await listOcrJob()});
};