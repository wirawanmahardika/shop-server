import bcrypt from "bcrypt";
import { User, Wallet, sequelize } from "../app/database.js";
import { error, sequelizeErrorResponse, success } from "../utils/response.js";
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
    const userInstance = await User.create(
      {
        ...data,
        wallet: {
          balance: 0,
        },
      },
      {
        include: [{ model: Wallet, as: "wallet" }],
      }
    );

    const user = userInstance.toJSON();
    delete user.password;
    delete user.id;
    return res.status(200).json({ ...success("Berhasil signup"), data: user });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const logout = (req, res) => {
  req.logOut((err) => {
    if (err) {
      logger.error(err);
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
    await User.update(
      { photo: req.file.buffer },
      { where: { id: req.user.id } }
    );
    return res.json({ ...success("Berhasil mengubah foto profile") });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const emptyPhoto = async (req, res) => {
  try {
    await User.update(
      { photo: null },
      { where: { id: req.user.id } }
    );
    return res.json({ ...success("Berhasil mengosongkan photo profile") });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const getMe = async (req, res) => {
  try {
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: [
        "email",
        "username",
        "fullname",
        "photo",
        "role",
        "emailValidated",
      ],
      include: [
        {
          model: Wallet,
          as: "wallet",
          attributes: ["balance"],
        },
      ],
    });

    const data = userRecord ? userRecord.toJSON() : null;
    return res.json({
      ...success("Berhasil mengambil user"),
      data: userBlobToImage(data),
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const editBio = async (req, res) => {
  delete req.body.password;
  try {
    await User.update(req.body, {
      where: { id: req.user.id },
    });
    return res.json({
      ...success("Berhasil update data user"),
      place: "top",
    });
  } catch (err) {
    logger.error(err);
    return res
      .status(500)
      .json({ ...error(500, "Something went wrong"), place: "top" });
  }
};

const getAllUsers = async (req, res) => {
  const skip = req.query.skip ? parseInt(req.query.skip) : undefined;
  try {
    const users = await User.findAll({
      offset: skip,
      order: [["role", "DESC"]],
      attributes: ["id", "username", "fullname", "email", "role", "photo"],
    });

    const data = users.map((u) => u.toJSON());
    return res.json({
      ...success("Berhasil mengambil Semua users"),
      data: data.map((d) => {
        d.photo = d.photo
          ? process.env.SERVER_URL + "/api/users/image/" + d.id
          : null;
        return d;
      }),
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const deleteUser = async (req, res) => {
  if (!req.params.id) {
    return res
      .status(403)
      .json({ ...error(403, "Membutuhkan kode unik user") });
  }
  try {
    const userRecord = await User.findOne({ where: { id: req.params.id } });
    if (!userRecord) {
      return res.status(404).json({ ...error(404, "User tidak ditemukan") });
    }
    const user = userRecord.toJSON();

    await sequelize.transaction(async (t) => {
      await Wallet.destroy({ where: { id_user: req.params.id }, transaction: t });
      await User.destroy({ where: { id: req.params.id }, transaction: t });
    });

    return res.json({ ...success("Berhasil menghapus user " + user.fullname) });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const getUserImage = async (req, res) => {
  try {
    const result = await User.findOne({
      where: {
        id: req.params.id_user,
      },
      attributes: ["photo"],
    });

    res.set("Content-Type", "image/jpeg");
    res.send(result ? result.photo : null);
  } catch (err) {
    logger.error(err);
    res.status(500).send("Something went wrong");
  }
};

const getTotalUser = async (req, res) => {
  try {
    const result = await User.count();
    res.send(result.toString());
  } catch (err) {
    logger.error(err);
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
