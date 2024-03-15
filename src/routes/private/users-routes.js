import express from "express";
import bcrypt from "bcrypt";
import { signupValidate } from "../../utils/signupValidate.js";
import { prisma } from "../../database/prisma-client.js";
import { error, prismaErrorResponse, success } from "../../utils/response.js";
import passport from "passport";
import multer from "multer";
import { mimetypeValidate } from "../../utils/mimetype-validate.js";
import {
  ensureAuthenticated,
  isAuthenticated,
} from "../../middleware/passport-middleware.js";
import { userBlobToImage } from "../../utils/blobToImage.js";
import { editBioRouteCheckKeys } from "../../middleware/itemKeysCheck.js";
import { verifyRole } from "../../middleware/role-verify.js";

const router = express.Router();

router.post("/signup", signupValidate, async (req, res) => {
  const { password, ...data } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);
  data.password = hashPassword;
  data.role = "user";

  try {
    const user = await prisma.users.create({
      data: {
        wallet: {
          create: {
            balance: 0,
          },
        },
        ...data,
      },
    });
    delete user.password;
    delete user.id;
    return res.status(200).json({ ...success("Berhasil signup"), data: user });
  } catch (err) {
    console.log(err);
    return prismaErrorResponse(res, err);
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
  (req, res) => {
    return res.json({ ...success("Berhasil login") });
  }
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
    if (!req.file) {
      return res.status(403).json({ ...error(403, "Membutuhkan image") });
    }
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
      return prismaErrorResponse(res, error);
    }
  }
);

router.delete("/empty-photo", isAuthenticated, async (req, res) => {
  try {
    await prisma.users.update({
      where: { id: req.user.id },
      data: { photo: null },
    });
    return res.json({ ...success("Berhasil mengosongkan photo profile") });
  } catch (err) {
    return prismaErrorResponse(res, err);
  } finally {
    await prisma.$disconnect();
  }
});

router.get("/getme", isAuthenticated, async (req, res) => {
  try {
    const data = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        email: true,
        username: true,
        fullname: true,
        photo: true,
        role: true,
        emailValidated: true,
        wallet: {
          select: {
            balance: true,
          },
        },
      },
    });
    return res.json({
      ...success("Berhasil mengambil user"),
      data: userBlobToImage(data),
    });
  } catch (err) {
    console.log(err);
    return prismaErrorResponse(res, err);
  } finally {
    await prisma.$disconnect();
  }
});

router.put(
  "/edit-bio",
  isAuthenticated,
  editBioRouteCheckKeys,
  async (req, res) => {
    delete req.body.password;
    try {
      await prisma.users.update({
        where: { id: req.user.id },
        data: req.body,
      });
      return res.json({
        ...success("Berhasil update data user"),
        place: "top",
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ ...error(500, "Something went wrong"), place: "top" });
    }
  }
);

router.get("/", isAuthenticated, verifyRole, async (req, res) => {
  const skip = req.query.skip;
  try {
    const data = await prisma.users.findMany({
      skip,
      orderBy: {
        role: "desc",
      },
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        role: true,
      },
    });
    return res.json({ ...success("Berhasil mengambil Semua users"), data });
  } catch (err) {
    console.log(err);
    return prismaErrorResponse(res, err);
  } finally {
    await prisma.$disconnect();
  }
});

router.delete("/:id", isAuthenticated, verifyRole, async (req, res) => {
  if (!req.params.id) {
    return res
      .status(403)
      .json({ ...error(403, "Membutuhkan kode unik user") });
  }
  try {
    const [wallet, user] = await prisma.$transaction([
      prisma.wallet.delete({ where: { id_user: req.params.id } }),
      prisma.users.delete({ where: { id: req.params.id } }),
    ]);
    return res.json({ ...success("Berhasil menghapus user " + user.fullname) });
  } catch (error) {
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
