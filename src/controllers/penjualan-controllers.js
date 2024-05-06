import { prisma } from "../database/prisma-client.js";
import { prismaErrorResponse, success } from "../utils/response.js";

const getDataPenjualan = async (req, res) => {
  const diterima = req.query.diterima;
  try {
    const data = await prisma.penjualan.findMany({
      where: {
        status: {
          in: diterima ? ["diterima"] : ["dikirim", "pengemasan", "sampai"],
        },
      },
      include: {
        item_terjual: {
          include: {
            items: {
              select: {
                name: true,
                photo_item: true,
              },
            },
          },
        },
        users: {
          select: { username: true },
        },
      },
    });
    const returnData = data.map((d) => {
      const newItemTerjual = [];
      d.item_terjual.forEach((i) => {
        i.name = i.items.name;
        i.photo_item = i.items.photo_item;
        i.photo_item =
          `data:image/png;base64,` + i.items.photo_item.toString("base64");
        delete i.items;
        newItemTerjual.push(i);
      });
      d.item_terjual = newItemTerjual;
      return d;
    });
    return res.json({
      ...success("Berhasil mengambil data penjualan"),
      data: returnData,
    });
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
};

const setPenjualanStatus = async (req, res) => {
  const status = req.body.status;
  const id_penjualan = req.params.id_penjualan;
  try {
    const data = await prisma.penjualan.update({
      where: { id_penjualan: parseInt(id_penjualan) },
      data: {
        status,
      },
    });
    return res.json({
      ...success("Berhasil mengatur status penjualan ke " + data.status),
    });
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
};

const setPenjualanStatusDiterima = async (req, res) => {
  const { id_penjualan } = req.body;
  try {
    await prisma.penjualan.update({
      where: { id_penjualan: parseInt(id_penjualan) },
      data: {
        status: "diterima",
      },
    });
    return res.json({ ...success("Barang berhasil diterima") });
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  }
};

const getAllItemPenjualan = async (req, res) => {
  const { id_penjualan } = req.query;
  try {
    const data = await prisma.item_terjual.findMany({
      where: {
        penjualan: {
          id_user: req.user.id,
          status: "diterima",
          id_penjualan: id_penjualan && parseInt(id_penjualan),
        },
      },
      include: {
        items: {
          select: { name: true, photo_item: true, price: true },
        },
      },
    });
    const returnData = data.map((d) => {
      d.items.photo_item = `data:image/png;base64,${d.items.photo_item.toString(
        "base64"
      )}`;
      return d;
    });
    return res.json({
      ...success("Berhasil mengambil history penjualan"),
      data: returnData,
    });
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
};

const getHistoryPenjualan = async (req, res) => {
  try {
    const data = await prisma.penjualan.findMany({
      where: { id_user: req.user.id },
      include: {
        item_terjual: {
          select: {
            price: true,
          },
        },
      },
    });
    return res.json({
      ...success("Berhasil mengambil history pembelian"),
      data,
    });
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
};

const deleteHistoryPenjualan = async (req, res) => {
  const id_penjualan = req.params.id_penjualan;
  try {
    await prisma.penjualan.delete({
      where: { id_penjualan: id_penjualan && parseInt(id_penjualan) },
    });
    return res.json({ ...success("Berhasil menghapus history penjualan") });
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
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
