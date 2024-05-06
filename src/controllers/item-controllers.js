import { prisma } from "../database/prisma-client.js";
import { error, prismaErrorResponse, success } from "../utils/response.js";
import { itemBlobsToImages } from "../utils/blobToImage.js";
import { arrayStringToInteger } from "../utils/arrayStringToInteger.js";

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
  } catch (err) {
    console.log(err);
    return prismaErrorResponse(res, err);
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

    let returnData = data.map((d) => {
      return { ...d, category: d.category.category, brand: d.brand.name_brand };
    });
    return res.json({
      ...success("Berhasil mengambil data"),
      data: returnData[0]?.photo_item
        ? itemBlobsToImages(returnData)
        : returnData,
    });
  } catch (err) {
    console.log(err);
    return prismaErrorResponse(res, err);
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
  } catch (err) {
    return prismaErrorResponse(res, err);
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
    console.log(error);
    return prismaErrorResponse(res, error);
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
    console.log(error);
    return prismaErrorResponse;
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
  } catch (err) {
    console.log(err);
    if (err.errorAt && err.errorAt === "prisma") {
      return res.status(402).json({ ...error(402, err.message) });
    }
    return prismaErrorResponse(res, err);
  }
};

export default {
  createNewItem,
  getAllItem,
  searchItem,
  editItemDetail,
  deleteItem,
  buyItem,
};
