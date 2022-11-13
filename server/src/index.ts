import express from "express";
import {initOcrJobsCron} from "./api/ocr-jobs/ocr-jobs-cron";
import routes from "./api/routes";
import {initDatabase} from "./database/init";
import cors from "cors";
const app = express();
const port = process.env.PORT || 3000;

if (process.env.LOCAL)
    app.use(cors());

app.get("/", (req, res) => {
    res.status(200).json({success: true});
});

app.use("/api", routes);

initDatabase().then(() => {
    initOcrJobsCron();

    app.listen(port, function () {
        console.log(`Express listning to port ${port}`);
    });
});

process.on('uncaughtException', err => { });