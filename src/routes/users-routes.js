import express from "express";
import bcrypt from "bcrypt";
import { signupValidate } from "../utils/signupValidate.js";
import { prisma } from "../database/prisma-client.js";
import { error, success } from "../utils/response.js";
import passport from "passport";
import multer from "multer";
import { mimetypeValidate } from "../utils/mimetype-validate.js";
import { ensureAuthenticated, isAuthenticated } from "../configs/passport.js";

const router = express.Router();

router.post("/signup", signupValidate, async (req, res) => {
  const { password, ...data } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);
  data.password = hashPassword;

  try {
    const user = await prisma.users.create({ data });
    delete user.password;
    delete user.id;
    return res.status(200).json({ ...success("Berhasil signup"), data: user });
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
});

router.post(
  "/login",
  ensureAuthenticated,
  passport.authenticate("local"),
  (err, req, res, next) => {
    if (err) {
      return res.status(401).json(err);
    }
  },
  (req, res) => res.json({ ...success("Berhasil login") })
);

router.delete("/logout", isAuthenticated, (req, res) => {
  req.logOut((err) => {
    if (err) {
      return res
        .status(403)
        .json({ ...error(403, "Tidak bisa melakukan logout") });
    }

    req.session.destroy();
    return res.json({ ...success("Berhasil logout") });
  });
});

router.patch(
  "/add-photo",
  multer().single("photo"),
  isAuthenticated,
  async (req, res) => {
    if (mimetypeValidate(req.file)) {
      return res
        .status(403)
        .json({ ...error(403, "Ekstensi file tidak valid") });
    }

    try {
      await prisma.users.update({
        where: { id: req.user.id },
        data: { photo: req.file.buffer },
      });
      return res.json({ ...success("Berhasil mengubah foto profile") });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        ...error(500, "Terjadi kesalahan saat mengubah foto profile"),
      });
    } finally {
      await prisma.$disconnect();
    }
  }
);

export default router;
