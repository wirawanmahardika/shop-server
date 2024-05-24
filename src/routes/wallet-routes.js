import express from "express";
import { isAuthenticated } from "../middleware/passport-middleware.js";
import { verifyRole } from "../middleware/role-verify.js";
import walletControllers from "../controllers/wallet-controllers.js";

const router = express.Router();

router.post("/", isAuthenticated, walletControllers.createWallet);

router.get("/user-wallet", isAuthenticated, walletControllers.getUserWallet);

router.get(
  "/get-all",
  isAuthenticated,
  verifyRole,
  walletControllers.getAllWallet
);

router.patch("/", isAuthenticated, verifyRole, walletControllers.editBalance);

export default router;
