import { Router } from "express";
import {
  register,
  verifyRegistration,
  resendVerificationCode,
  login,
  logout,
  getProfile,
  requestRecoveryCode,
  resetPasswordWithCode,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-registration", verifyRegistration);
router.post("/resend-verification", resendVerificationCode);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", verifyToken, getProfile);
router.post("/request-recovery", requestRecoveryCode);
router.post("/reset-password", resetPasswordWithCode);

export default router;
