import { sequelizeErrorResponse, success } from "../utils/response.js";
import { Wallet } from "../app/database.js";
import logger from "../app/logger.js";

const createWallet = async (req, res) => {
  try {
    const walletRecord = await Wallet.create({ id_user: req.user.id });
    const data = walletRecord.toJSON();
    return res.json({ ...success("berhasil", 201), data });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const getUserWallet = async (req, res) => {
  try {
    const walletRecord = await Wallet.findOne({
      where: { id_user: req.user.id },
    });
    const data = walletRecord ? walletRecord.toJSON() : null;
    return res.json({ ...success("Berhasil mengambil data user", data) });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const getAllWallet = async (req, res) => {
  try {
    const walletRecords = await Wallet.findAll({});
    const data = walletRecords.map((w) => w.toJSON());
    return res.json(data);
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const editBalance = async (req, res) => {
  const { balance, id_user } = req.body;

  try {
    await Wallet.update({ balance }, { where: { id_user } });
    const walletRecord = await Wallet.findOne({ where: { id_user } });
    const data = walletRecord ? walletRecord.toJSON() : null;
    return res.json({
      ...success("Berhasil menambah balance pada user " + id_user),
      data,
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

export default { createWallet, getUserWallet, getAllWallet, editBalance };
