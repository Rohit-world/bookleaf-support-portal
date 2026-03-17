import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { streamEvents } from "./realtime.controller";

const router = Router();

router.get("/stream", authMiddleware, streamEvents);

export default router;
