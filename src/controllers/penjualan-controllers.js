import logger from "../app/logger.js";
import { Penjualan, ItemTerjual, Item, User } from "../app/database.js";
import { sequelizeErrorResponse, success } from "../utils/response.js";
import { Op } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const getDataPenjualan = async (req, res) => {
  const diterima = req.query.diterima;
  try {
    const statusFilter = diterima
      ? ["diterima"]
      : ["dikirim", "pengemasan", "sampai"];

    const penjualanRecords = await Penjualan.findAll({
      where: {
        status: { [Op.in]: statusFilter },
      },
      include: [
        {
          model: ItemTerjual,
          as: "item_terjual",
          include: [
            {
              model: Item,
              as: "items",
              attributes: ["id_item", "name", "photo_item"],
            },
          ],
        },
        {
          model: User,
          as: "users",
          attributes: ["username"],
        },
      ],
    });

    const data = penjualanRecords.map((p) => p.toJSON());

    const returnData = data.map((d) => {
      const newItemTerjual = [];
      if (d.item_terjual) {
        d.item_terjual.forEach((i) => {
          if (i.items) {
            i.name = i.items.name;
            i.photo_item = i.items.photo_item;
            i.photo_item =
              process.env.SERVER_URL + "/api/items/image/" + i.id_item;
            delete i.items;
          }
          newItemTerjual.push(i);
        });
      }
      d.item_terjual = newItemTerjual;
      return d;
    });

    return res.json({
      ...success("Berhasil mengambil data penjualan"),
      data: returnData,
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const setPenjualanStatus = async (req, res) => {
  const status = req.body.status;
  const id_penjualan = req.params.id_penjualan;
  try {
    const idPenjualan = parseInt(id_penjualan);
    await Penjualan.update(
      { status },
      { where: { id_penjualan: idPenjualan } }
    );
    return res.json({
      ...success("Berhasil mengatur status penjualan ke " + status),
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const setPenjualanStatusDiterima = async (req, res) => {
  const { id_penjualan } = req.body;
  try {
    const idPenjualan = parseInt(id_penjualan);
    await Penjualan.update(
      { status: "diterima" },
      { where: { id_penjualan: idPenjualan } }
    );
    return res.json({ ...success("Barang berhasil diterima") });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const getAllItemPenjualan = async (req, res) => {
  const { id_penjualan } = req.query;
  try {
    const penjualanWhere = {
      id_user: req.user.id,
      status: "diterima",
    };
    if (id_penjualan) {
      penjualanWhere.id_penjualan = parseInt(id_penjualan);
    }

    const itemTerjualRecords = await ItemTerjual.findAll({
      include: [
        {
          model: Penjualan,
          as: "penjualan",
          where: penjualanWhere,
          attributes: [],
        },
        {
          model: Item,
          as: "items",
          attributes: ["name", "photo_item", "price"],
        },
      ],
    });

    const data = itemTerjualRecords.map((i) => i.toJSON());
    const returnData = data.map((d) => {
      if (d.items && d.items.photo_item) {
        d.items.photo_item = `data:image/png;base64,${Buffer.from(
          d.items.photo_item
        ).toString("base64")}`;
      }
      return d;
    });

    return res.json({
      ...success("Berhasil mengambil history penjualan"),
      data: returnData,
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const getHistoryPenjualan = async (req, res) => {
  try {
    const penjualanRecords = await Penjualan.findAll({
      where: { id_user: req.user.id },
      include: [
        {
          model: ItemTerjual,
          as: "item_terjual",
          attributes: ["price"],
        },
      ],
    });

    const data = penjualanRecords.map((p) => p.toJSON());
    return res.json({
      ...success("Berhasil mengambil history pembelian"),
      data,
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const deleteHistoryPenjualan = async (req, res) => {
  const id_penjualan = req.params.id_penjualan;
  try {
    const idPenjualan = parseInt(id_penjualan);
    await Penjualan.destroy({
      where: { id_penjualan: idPenjualan },
    });
    return res.json({ ...success("Berhasil menghapus history penjualan") });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

export default {
  getDataPenjualan,
  setPenjualanStatus,
  setPenjualanStatusDiterima,
  getAllItemPenjualan,
  getHistoryPenjualan,
  deleteHistoryPenjualan,
};
