import { Router } from "express";
const routes = Router();

routes.get("/", (req, res) => {
    res.status(200).json({ message: "ocr jobs" });
});

export default routes;