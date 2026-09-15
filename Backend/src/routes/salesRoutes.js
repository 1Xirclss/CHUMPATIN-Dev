import { Router } from "express";
import {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  togglePaymentStatus,
  deliverWristband,
  deleteSale,
} from "../controllers/salesController.js";
import { importFromExcel, clearAllData } from "../controllers/importExcelController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

// Todas las operaciones de ventas
router.get("/", verifyToken, getSales);
router.get("/:id", verifyToken, getSaleById);
router.post("/", verifyToken, createSale);
router.put("/:id", verifyToken, updateSale);
router.patch("/:id/toggle-status", verifyToken, togglePaymentStatus);
router.patch("/:id/deliver-wristband", verifyToken, deliverWristband);
router.delete("/:id", verifyToken, deleteSale);

// Endpoints de archivo Excel y vaciado de datos
router.post("/import-excel", verifyToken, importFromExcel);
router.post("/clear-all", verifyToken, clearAllData);

export default router;
