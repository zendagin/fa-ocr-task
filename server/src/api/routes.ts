import { Router } from "express";
import ocrJobs from "./ocr-jobs/routes";

const routes = Router();
routes.use("/ocr-jobs", ocrJobs);

export default routes;