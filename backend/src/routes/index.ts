import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import authorRoutes from "../modules/author/author.routes";
import adminRoutes from "../modules/admin/admin.routes";
import realtimeRoutes from "../modules/realtime/realtime.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

router.use("/auth", authRoutes);
router.use("/author", authorRoutes);
router.use("/admin", adminRoutes);
router.use("/events", realtimeRoutes);

export default router;
