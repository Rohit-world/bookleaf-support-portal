import { Router } from "express";
import { getCurrentUser, login } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
