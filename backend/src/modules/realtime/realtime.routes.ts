import { Router } from "express";
import { streamEvents } from "./realtime.controller";

const router = Router();

router.get("/stream", streamEvents);

export default router;
