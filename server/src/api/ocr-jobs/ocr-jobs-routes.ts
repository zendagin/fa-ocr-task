import {Router} from "express";
import {createOcrJobHandler, getOcrJobHandler, listOcrJobsHandler} from "./ocr-jobs-handlers";
import multer from "multer";

const routes = Router();

routes.post("/", multer().single("file"), createOcrJobHandler);
routes.get("/", listOcrJobsHandler);
routes.get("/:jobId", getOcrJobHandler);

export default routes;