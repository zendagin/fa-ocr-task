import axios from "axios";
import crypto from "crypto";
import {RequestHandler} from "express";
import FormData from "form-data";
import {AppDataSource} from "../../database/data-source";
import {OcrJob} from "../../database/entities/ocr-job";
import {faApiAccessToken, faApiUrl, faApiVersion} from "../../fa-api";

function jobRepo() {return AppDataSource.getRepository(OcrJob);}

export const createOcrJob: RequestHandler = async (req, res) => {
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

    const old = await jobRepo().findOneBy({
        filename: originalname,
        sha256,
        faApiVersion: faApiVersion()
    });

    if (old) {
        res.json({job: old});
        return;
    }

    const formData = new FormData();
    formData.append("file", buffer, originalname);
    
    const convertRes = await axios.post(faApiUrl("/convert_to_jpg/async"), formData, {
        headers: {
            ...formData.getHeaders(),
            Authorization: "Bearer " + faApiAccessToken()
        },
    });

    if (convertRes.data.result !== "SUCCESS") {
        res.status(500).json({message: `Error on converting pdf.`, data: convertRes.data});
        return;
    }

    const ocrJob = new OcrJob();
    ocrJob.filename = originalname;
    ocrJob.sha256 = sha256;
    ocrJob.faApiVersion = faApiVersion();
    ocrJob.faConvertJobId = convertRes.data.lid;
    const inserted = await jobRepo().insert(ocrJob);

    res.json({job: inserted.generatedMaps[0]});
};

export const getOcrJob: RequestHandler = async (req, res) => {
    const id = req.params.jobId;
    const job = await jobRepo().findOne({
        where: {
            id: Number(id),
        }
    });

    if (!job) {
        res.status(404).json({message: `Job ${id} not found.`});
    } else {
        res.json({ocrJob: job});
    }
};

export const listOcrJobs: RequestHandler = async (req, res) => {
    const jobs = await jobRepo().find();
    res.json({ocrJobs: jobs});
};