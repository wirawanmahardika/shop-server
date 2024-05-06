import express from "express";
import { signupValidate } from "../../utils/signupValidate.js";
import passport from "passport";
import multer from "multer";
import { editBioRouteCheckKeys } from "../../middleware/itemKeysCheck.js";
import { verifyRole } from "../../middleware/role-verify.js";
import usersControllers from "../../controllers/users-controllers.js";
import {
  ensureAuthenticated,
  isAuthenticated,
} from "../../middleware/passport-middleware.js";
import { success } from "../../utils/response.js";

const router = express.Router();

router.post("/signup", signupValidate, usersControllers.signup);

router.post(
  "/login",
  ensureAuthenticated,
  passport.authenticate("local"),
  (err, req, res, next) => {
    if (err) {
      return res.status(401).json(err);
    }
  },
  (req, res) => {
    return res.json({ ...success("Berhasil login") });
  }
);

router.delete("/logout", isAuthenticated, usersControllers.logout);

router.patch(
  "/add-photo",
  multer().single("photo"),
  isAuthenticated,
  usersControllers.addPhoto
);

router.delete("/empty-photo", isAuthenticated, usersControllers.emptyPhoto);

router.get("/getme", isAuthenticated, usersControllers.getMe);

router.put(
  "/edit-bio",
  isAuthenticated,
  editBioRouteCheckKeys,
  usersControllers.editBio
);

router.get("/", isAuthenticated, verifyRole, usersControllers.getAllUsers);

router.delete("/:id", isAuthenticated, verifyRole, usersControllers.deleteUser);

export default router;
