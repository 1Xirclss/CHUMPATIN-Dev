import { Router } from "express";
import { getDashboardStats } from "../controllers/reportsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/dashboard-stats", verifyToken, getDashboardStats);

export default router;
