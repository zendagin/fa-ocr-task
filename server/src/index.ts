import express from "express";
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).json({success: true});
});

app.listen(port, function () {
    console.log(`Express listning to port ${port}`);
});
