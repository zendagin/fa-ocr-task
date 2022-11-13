import {RequestHandler} from "express";
import {AppDataSource} from "../../database/data-source";
import {OcrJob} from "../../database/entities/ocr-job";

function jobRepo() {return AppDataSource.getRepository(OcrJob);}

export const createOcrJob: RequestHandler = async (req, res) => {
    // TODO
    res.json({todo: true});
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