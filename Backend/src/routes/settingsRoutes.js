import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", verifyToken, getSettings);
router.put("/", verifyToken, requireAdmin, updateSettings);

export default router;
