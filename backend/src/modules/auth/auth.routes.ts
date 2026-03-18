import { Router } from "express";
import { getCurrentUser, login } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { loginSchema } from "../../validators/auth.validator";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
