
import axios from "axios";
import FormData from "form-data";
import {ObjectLiteral} from "typeorm";
import {AppDataSource} from "../../database/data-source";
import {OcrJob} from "../../database/entities/ocr-job";
import {faApiAccessToken, faApiUrl, faApiVersion} from "../../fa-api";

function jobRepo() {return AppDataSource.getRepository(OcrJob);}

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
    ocrJob.faConvertJobId = convertRes.data.lid;
    const inserted = await jobRepo().insert(ocrJob);
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
        where: {id}
    });
}

export async function listOcrJob() {
    return await jobRepo().find();
}