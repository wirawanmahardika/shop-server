import bcrypt from "bcrypt";
import { prisma } from "../app/prisma.js";
import { error, prismaErrorResponse, success } from "../utils/response.js";
import { mimetypeValidate } from "../utils/mimetype-validate.js";
import { userBlobToImage } from "../utils/blobToImage.js";
import dotenv from "dotenv";
import logger from "../app/logger.js";

dotenv.config();

const signup = async (req, res) => {
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
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const logout = (req, res) => {
  req.logOut((error) => {
    if (error) {
      logger.error(error);
      return res
        .status(403)
        .json({ ...error(403, "Tidak bisa melakukan logout") });
    }

    req.session.destroy();
    return res.json({ ...success("Berhasil logout") });
  });
};

const addPhoto = async (req, res) => {
  if (!req.file) {
    return res.status(403).json({ ...error(403, "Membutuhkan image") });
  }
  if (mimetypeValidate(req.file)) {
    return res.status(403).json({ ...error(403, "Ekstensi file tidak valid") });
  }

  try {
    await prisma.users.update({
      where: { id: req.user.id },
      data: { photo: req.file.buffer },
    });
    return res.json({ ...success("Berhasil mengubah foto profile") });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const emptyPhoto = async (req, res) => {
  try {
    await prisma.users.update({
      where: { id: req.user.id },
      data: { photo: null },
    });
    return res.json({ ...success("Berhasil mengosongkan photo profile") });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const getMe = async (req, res) => {
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
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const editBio = async (req, res) => {
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
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ ...error(500, "Something went wrong"), place: "top" });
  }
};

const getAllUsers = async (req, res) => {
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
        photo: true,
      },
    });
    return res.json({
      ...success("Berhasil mengambil Semua users"),
      data: data.map((d) => {
        d.photo = d.photo
          ? process.env.SERVER_URL + "/api/users/image/" + d.id
          : null;
        return d;
      }),
    });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const deleteUser = async (req, res) => {
  if (!req.params.id) {
    return res
      .status(403)
      .json({ ...error(403, "Membutuhkan kode unik user") });
  }
  try {
    const [_, user] = await prisma.$transaction([
      prisma.wallet.delete({ where: { id_user: req.params.id } }),
      prisma.users.delete({ where: { id: req.params.id } }),
    ]);
    return res.json({ ...success("Berhasil menghapus user " + user.fullname) });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const getUserImage = async (req, res) => {
  try {
    const result = await prisma.users.findUnique({
      where: {
        id: req.params.id_user,
      },
      select: { photo: true },
    });

    res.set("Content-Type", "image/jpeg");
    res.send(result.photo);
  } catch (error) {
    logger.error(error);
    res.status(500).send("Something went wrong");
  }
};

const getTotalUser = async (req, res) => {
  try {
    const result = await prisma.users.count();
    res.send(result.toString());
  } catch (error) {
    logger.error(error);
    res.status(500).send("something went wrong");
  }
};

export default {
  signup,
  logout,
  addPhoto,
  emptyPhoto,
  getMe,
  editBio,
  getAllUsers,
  deleteUser,
  getUserImage,
  getTotalUser,
};
