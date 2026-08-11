import { Item, Brand, Category, Wallet, Penjualan, ItemTerjual, sequelize } from "../app/database.js";
import { error, sequelizeErrorResponse, success, sequelizeTransactionErrorHandler } from "../utils/response.js";
import { itemBlobsToImages } from "../utils/blobToImage.js";
import { arrayStringToInteger } from "../utils/arrayStringToInteger.js";
import { Op } from "sequelize";
import dotenv from "dotenv";
import logger from "../app/logger.js";

dotenv.config();

const createNewItem = async (req, res) => {
  const { id_brand, id_category, name, stock, price } = req.body;

  try {
    const newItem = await Item.create({
      id_brand: parseInt(id_brand),
      id_category: parseInt(id_category),
      name,
      stock: parseInt(stock),
      price: parseInt(price),
      rating: null,
      photo_item: req.file ? req.file.buffer : null,
    });

    const fetchedItem = await Item.findOne({
      where: { id_item: newItem.id_item },
      attributes: ["id_item", "name", "price", "stock"],
      include: [
        { model: Brand, as: "brand", attributes: ["id_brand", "name_brand"] },
        { model: Category, as: "category", attributes: ["id_category", "category"] },
      ],
    });

    const itemJson = fetchedItem.toJSON();
    const returnData = {
      ...itemJson,
      category: itemJson.category.category,
      brand: itemJson.brand.name_brand,
    };

    return res.json({
      ...success("Berhasil membuat items baru"),
      data: returnData,
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const getAllItem = async (req, res) => {
  const withPhoto = req.query.withPhoto;
  try {
    let itemRecords;
    if (withPhoto === "yes") {
      itemRecords = await Item.findAll({
        attributes: ["id_item", "name", "price", "stock"],
        include: [
          { model: Brand, as: "brand", attributes: ["id_brand", "name_brand"] },
          { model: Category, as: "category", attributes: ["id_category", "category"] },
        ],
      });
    } else {
      itemRecords = await Item.findAll({
        where: {
          stock: { [Op.gt]: 0 },
        },
        include: [
          { model: Category, as: "category", attributes: ["category"] },
          { model: Brand, as: "brand", attributes: ["name_brand"] },
        ],
      });
    }

    const data = itemRecords.map((i) => i.toJSON());

    const returnData = data.map((d) => {
      return {
        ...d,
        category: d.category ? d.category.category : null,
        brand: d.brand ? d.brand.name_brand : null,
        photo_item: process.env.SERVER_URL + "/api/items/image/" + d.id_item,
      };
    });

    return res.json({
      ...success("Berhasil mengambil data"),
      data: returnData,
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const searchItem = async (req, res) => {
  let { brands, categories, name, harga_gte, harga_lte } = req.body;
  if (categories) {
    categories = arrayStringToInteger(categories);
  }

  if (brands) {
    brands = arrayStringToInteger(brands);
  }

  try {
    const whereClause = {};
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (harga_gte !== undefined || harga_lte !== undefined) {
      whereClause.price = {};
      if (harga_gte !== undefined) whereClause.price[Op.gte] = parseInt(harga_gte);
      if (harga_lte !== undefined) whereClause.price[Op.lte] = parseInt(harga_lte);
    }
    if (brands && brands.length > 0) {
      whereClause.id_brand = { [Op.in]: brands };
    }
    if (categories && categories.length > 0) {
      whereClause.id_category = { [Op.in]: categories };
    }

    const itemRecords = await Item.findAll({
      where: whereClause,
    });

    const data = itemRecords.map((i) => i.toJSON());

    return res.json({
      ...success("Berhasil mengambil data"),
      data: itemBlobsToImages(data),
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const editItemDetail = async (req, res) => {
  const data = req.body;
  try {
    const updateData = { ...data };
    if (req.file) {
      updateData.photo_item = req.file.buffer;
    }

    await Item.update(updateData, {
      where: {
        id_item: data.id_item,
      },
    });

    const itemRecord = await Item.findByPk(data.id_item);
    const returnData = itemRecord ? itemRecord.toJSON() : { name: data.name };

    return res.json({
      ...success("Berhasil mengupdate item " + returnData.name),
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const deleteItem = async (req, res) => {
  const id_item = req.params.id_item;
  if (!id_item) {
    return res.status(403).json({ ...error(403, "Membutuhkan id dari item") });
  }
  try {
    const idItem = parseInt(id_item);
    const itemRecord = await Item.findByPk(idItem);
    if (!itemRecord) {
      return res.status(404).json({ ...error(404, "Item tidak ditemukan") });
    }
    const data = itemRecord.toJSON();

    await Item.destroy({
      where: { id_item: idItem },
    });
    return res.json({ ...success("Berhasil menghapus " + data.name) });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const buyItem = async (req, res) => {
  const id_user = req.user.id;
  const { items } = req.body;

  if (!(items && items.length > 0)) {
    return res.status(403).json({
      ...error(403, "Membutuhkan item sebelum melakukan proses transaksi"),
    });
  }

  try {
    await sequelize.transaction(async (t) => {
      let totalPurchasePrice = 15_000;
      const itemTerjualData = [];

      for (const { id_item, quantity } of items) {
        const itemRecord = await Item.findByPk(id_item, { transaction: t });
        if (!itemRecord) {
          throw new sequelizeTransactionErrorHandler("Item tidak ditemukan");
        }
        const item = itemRecord.toJSON();
        const priceItem = item.price * quantity;
        totalPurchasePrice += priceItem;

        if (quantity > item.stock) {
          throw new sequelizeTransactionErrorHandler(
            "Jumlah barang yang ingin dibeli melebihi stock yang tersedia"
          );
        }

        await Item.update(
          { stock: item.stock - quantity },
          { where: { id_item }, transaction: t }
        );

        itemTerjualData.push({ id_item, quantity, price: priceItem });
      }

      const userWalletRecord = await Wallet.findOne({
        where: { id_user },
        transaction: t,
      });

      if (!userWalletRecord || userWalletRecord.balance < totalPurchasePrice) {
        throw new sequelizeTransactionErrorHandler("Saldo tidak mencukupi");
      }

      await Wallet.update(
        { balance: userWalletRecord.balance - totalPurchasePrice },
        { where: { id_user }, transaction: t }
      );

      const newPenjualan = await Penjualan.create(
        {
          id_user: req.user.id,
          status: "pengemasan",
          tanggal_beli: new Date(),
        },
        { transaction: t }
      );

      const itemTerjualWithFk = itemTerjualData.map((it) => ({
        ...it,
        id_penjualan: newPenjualan.id_penjualan,
      }));

      await ItemTerjual.bulkCreate(itemTerjualWithFk, { transaction: t });
    });

    return res.json({
      ...success("Pembelian berhasil, barang akan segera diantarkan"),
    });
  } catch (err) {
    logger.error(err);
    if (err.errorAt && err.errorAt === "sequelize") {
      return res.status(402).json({ ...error(402, err.message) });
    }
    return sequelizeErrorResponse(res, err);
  }
};

const getItemImage = async (req, res) => {
  try {
    const id_item = parseInt(req.params.id_item);
    const result = await Item.findOne({
      where: { id_item: id_item },
      attributes: ["photo_item"],
    });

    res.set("Content-Type", "image/jpeg");
    res.send(result ? result.photo_item : null);
  } catch (err) {
    logger.error(err);
    res.status(500).send("something went wrong");
  }
};

const getTotalItems = async (req, res) => {
  try {
    const result = await Item.count();
    return res.send(result.toString());
  } catch (err) {
    logger.error(err);
    res.status(500).send("Something went wrong");
  }
};

export default {
  createNewItem,
  getAllItem,
  searchItem,
  editItemDetail,
  deleteItem,
  buyItem,
  getItemImage,
  getTotalItems,
};
