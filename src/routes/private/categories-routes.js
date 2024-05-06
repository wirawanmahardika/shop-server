import express from "express";
import { isAuthenticated } from "../../middleware/passport-middleware.js";
import { verifyRole } from "../../middleware/role-verify.js";
import multer from "multer";
import categoryControllers from "../../controllers/category-controllers.js";

const router = express.Router();

router.get("/", categoryControllers.getCategories);

router.post(
  "/",
  isAuthenticated,
  verifyRole,
  multer().single("image"),
  categoryControllers.createNewCategory
);

router.patch(
  "/edit-category",
  isAuthenticated,
  verifyRole,
  multer().single("photo"),
  categoryControllers.editPhoto
);

router.delete(
  "/:id_category",
  isAuthenticated,
  verifyRole,
  categoryControllers.deleteCategory
);

export default router;
