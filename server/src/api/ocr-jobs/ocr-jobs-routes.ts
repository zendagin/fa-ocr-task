import {Router} from "express";
import {createOcrJob, getOcrJob, listOcrJobs} from "./ocr-jobs-handlers";

const routes = Router();

routes.post("/", createOcrJob);
routes.get("/", listOcrJobs);
routes.get("/:jobId", getOcrJob);

export default routes;