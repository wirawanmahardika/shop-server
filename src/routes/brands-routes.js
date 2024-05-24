import express from "express";
import multer from "multer";
import { verifyRole } from "../middleware/role-verify.js";
import { isAuthenticated } from "../middleware/passport-middleware.js";

import brandControllers from "../controllers/brand-controllers.js";

const router = express.Router();

router.post(
  "/",
  // user harus login sebelum bisa menbambah brand baru
  isAuthenticated,
  // user harus merupakan admin jika ingin menambah brand baru
  verifyRole,
  // middleware ini digunakan untuk memparsing blob buffer
  multer().single("image"),
  brandControllers.addBrand
);

router.get("/", brandControllers.getBrandsBasedOnQuery);

router.patch(
  "/edit-brand",
  isAuthenticated,
  verifyRole,
  multer().single("photo"),
  brandControllers.editBrand
);

router.delete(
  "/:id_brand",
  isAuthenticated,
  verifyRole,
  brandControllers.deleteBrand
);

router.get(
  "/image/:id_brand",
  isAuthenticated,
  verifyRole,
  brandControllers.getBrandImage
);

export default router;
