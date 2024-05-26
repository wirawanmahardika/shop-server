import { prisma } from "../app/prisma.js";
import { error, prismaErrorResponse, success } from "../utils/response.js";
import { itemBlobsToImages } from "../utils/blobToImage.js";
import { arrayStringToInteger } from "../utils/arrayStringToInteger.js";
import dotenv from "dotenv";
import logger from "../app/logger.js";

dotenv.config();

const createNewItem = async (req, res) => {
  // mengambil data dari request body untuk disimpan ke database
  const { id_brand, id_category, name, stock, price } = req.body;

  try {
    // menyimpan data ke database
    const data = await prisma.items.create({
      data: {
        id_brand: parseInt(id_brand),
        id_category: parseInt(id_category),
        name,
        stock: parseInt(stock),
        price: parseInt(price),
        rating: null,
        photo_item: req.file.buffer,
      },
      select: {
        id_item: true,
        name: true,
        price: true,
        stock: true,
        brand: { select: { name_brand: true, id_brand: true } },
        category: { select: { id_category: true, category: true } },
      },
    });
    const returnData = {
      ...data,
      category: data.category.category,
      brand: data.brand.name_brand,
    };
    // memberikan response berhasil beserta dengan datanya
    return res.json({
      ...success("Berhasil membuat items baru"),
      data: returnData,
    });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const getAllItem = async (req, res) => {
  const withPhoto = req.query.withPhoto;
  try {
    let data;
    if (withPhoto === "yes") {
      data = await prisma.items.findMany({
        select: {
          id_item: true,
          name: true,
          price: true,
          stock: true,
          brand: { select: { name_brand: true, id_brand: true } },
          category: { select: { id_category: true, category: true } },
        },
      });
    } else {
      data = await prisma.items.findMany({
        where: {
          stock: { gt: 0 },
        },
        include: {
          category: { select: { category: true } },
          brand: { select: { name_brand: true } },
        },
      });
    }

    const returnData = data.map((d) => {
      return {
        ...d,
        category: d.category.category,
        brand: d.brand.name_brand,
        photo_item: process.env.SERVER_URL + "/api/items/image/" + d.id_item,
      };
    });

    return res.json({
      ...success("Berhasil mengambil data"),
      data: returnData,
    });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const searchItem = async (req, res) => {
  // filter yang disediakan seperti nama-nama brand, categories, name dari item, dan limit harga
  let { brands, categories, name, harga_gte, harga_lte } = req.body;
  // karena id_brand dan id_category merupakan string, maka perlu diparsing menjadi integer
  // jika categories memiliki nilai maka parse data tersebut
  if (categories) {
    categories = arrayStringToInteger(categories);
  }

  // jika brands memiliki nilai maka parse data tersebut
  if (brands) {
    brands = arrayStringToInteger(brands);
  }

  try {
    const data = await prisma.items.findMany({
      where: {
        name: {
          contains: name,
        },
        price: {
          gte: harga_gte ? parseInt(harga_gte) : undefined,
          lte: harga_lte ? parseInt(harga_lte) : undefined,
        },
        id_brand: {
          in: brands,
        },
        id_category: {
          in: categories,
        },
      },
    });
    // let returnData = data.map((d) => {
    //   return { ...d, category: d.category.category, brand: d.brand.name_brand };
    // });

    return res.json({
      ...success("Berhasil mengambil data"),
      data: itemBlobsToImages(data),
    });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const editItemDetail = async (req, res) => {
  const data = req.body;
  try {
    const returnData = await prisma.items.update({
      where: {
        id_item: data.id_item,
      },
      data: { photo_item: req.file?.buffer, ...data },
    });

    return res.json({
      ...success("Berhasil mengupdate item " + returnData.name),
    });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, erroror);
  }
};

const deleteItem = async (req, res) => {
  const id_item = req.params.id_item;
  if (!id_item) {
    return res.status(403).json({ ...error(403, "Membutuhkan id dari item") });
  }
  try {
    const data = await prisma.items.delete({
      where: { id_item: parseInt(id_item) },
    });
    return res.json({ ...success("Berhasil menghapus " + data.name) });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
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
    await prisma.$transaction(async (prisma) => {
      let totalPurchasePrice = 15_000; // 15000 is shipping cost
      const itemTerjual = [];

      for (const { id_item, quantity } of items) {
        const item = await prisma.items.findUnique({ where: { id_item } });
        const priceItem = item.price * quantity;
        totalPurchasePrice += priceItem;

        if (quantity > item.stock) {
          throw new prismaTransactionErrorHandler(
            "Jumlah barang yang ingin dibeli melebihi stock yang tersedia"
          );
        }

        await prisma.items.update({
          where: { id_item },
          data: {
            stock: item.stock - quantity,
          },
        });

        itemTerjual.push({ id_item, quantity, price: priceItem });
      }

      const userWallet = await prisma.wallet.findUnique({ where: { id_user } });
      if (!userWallet || userWallet.balance < totalPurchasePrice) {
        throw new prismaTransactionErrorHandler("Saldo tidak mencukupi");
      }
      await prisma.wallet.update({
        where: { id_user },
        data: { balance: userWallet.balance - totalPurchasePrice },
      });

      await prisma.penjualan.create({
        data: {
          id_user: req.user.id,
          status: "pengemasan",
          tanggal_beli: new Date(),
          item_terjual: {
            createMany: {
              data: itemTerjual,
            },
          },
        },
      });
    });

    return res.json({
      ...success("Pembelian berhasil, barang akan segera diantarkan"),
    });
  } catch (error) {
    logger.error(error);
    if (error.errorAt && error.errorAt === "prisma") {
      return res.status(402).json({ ...error(402, error.message) });
    }
    return prismaErrorResponse(res, error);
  }
};

const getItemImage = async (req, res) => {
  try {
    const id_item = parseInt(req.params.id_item);
    const result = await prisma.items.findUnique({
      where: { id_item: id_item },
      select: { photo_item: true },
    });

    res.set("Content-Type", "image/jpeg");
    res.send(result.photo_item);
  } catch (error) {
    logger.error(error);
    res.status(500).send("something went wrong");
  }
};

const getTotalItems = async (req, res) => {
  try {
    const result = await prisma.items.count();
    return res.send(result.toString());
  } catch (error) {
    logger.error(error);
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
