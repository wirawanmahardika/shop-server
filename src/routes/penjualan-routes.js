import express from "express";
import { isAuthenticated } from "../middleware/passport-middleware.js";
import { verifyRole } from "../middleware/role-verify.js";
import penjualanControllers from "../controllers/penjualan-controllers.js";

const router = express.Router();

router.get("/", isAuthenticated, penjualanControllers.getDataPenjualan);

router.patch(
  "/status/:id_penjualan",
  isAuthenticated,
  verifyRole,
  penjualanControllers.setPenjualanStatus
);

router.patch(
  "/terima",
  isAuthenticated,
  penjualanControllers.setPenjualanStatusDiterima
);

router.get("/items", isAuthenticated, penjualanControllers.getAllItemPenjualan);

router.get(
  "/history",
  isAuthenticated,
  penjualanControllers.getHistoryPenjualan
);

router.delete(
  "/:id_penjualan",
  isAuthenticated,
  penjualanControllers.deleteHistoryPenjualan
);

export default router;
