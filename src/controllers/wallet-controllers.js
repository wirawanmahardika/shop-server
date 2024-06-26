import { prismaErrorResponse, success } from "../utils/response.js";
import { prisma } from "../app/prisma.js";
import logger from "../app/logger.js";

const createWallet = async (req, res) => {
  try {
    const data = await prisma.wallet.create({ data: { id_user: req.user.id } });
    return res.json({ ...success("berhasil", 201), data });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const getUserWallet = async (req, res) => {
  try {
    const data = await prisma.wallet.findUnique({
      where: { id_user: req.user.id },
    });
    return res.json({ ...success("Berhasil mengambil data user", data) });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const getAllWallet = async (req, res) => {
  try {
    const data = await prisma.wallet.findMany({});
    return res.json(data);
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const editBalance = async (req, res) => {
  const { balance, id_user } = req.body;

  try {
    const data = await prisma.wallet.update({
      where: { id_user },
      data: { balance },
    });
    return res.json({
      ...success("Berhasil menambah balance pada user " + id_user),
      data,
    });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

export default { createWallet, getUserWallet, getAllWallet, editBalance };
