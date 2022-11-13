import express from "express";
import {initOcrJobsCron} from "./api/ocr-jobs/ocr-jobs-cron";
import routes from "./api/routes";
import {initDatabase} from "./database/init";
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).json({success: true});
});

app.use(routes);

initDatabase().then(() => {
    initOcrJobsCron();

    app.listen(port, function () {
        console.log(`Express listning to port ${port}`);
    });
});
