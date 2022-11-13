import {Router} from "express";
import {createOcrJob, getOcrJob, listOcrJobs} from "./ocr-jobs-handlers";
import multer from "multer";

const routes = Router();

routes.post("/", multer().single("file"), createOcrJob);
routes.get("/", listOcrJobs);
routes.get("/:jobId", getOcrJob);

export default routes;