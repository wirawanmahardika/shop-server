import express from "express";
import { verifyRole } from "../middleware/role-verify.js";
import { prisma } from "../database/prisma-client.js";
import { isAuthenticated } from "../middleware/passport-middleware.js";
import {
  reqBodyCheckIsThereKey,
  reqBodyCheckKeys,
} from "../middleware/itemKeysCheck.js";
import { error, prismaErrorResponse, success } from "../utils/response.js";
import { arrayStringToInteger } from "../utils/arrayStringToInteger.js";
import multer from "multer";
import { itemBlobsToImages } from "../utils/blobToImage.js";

const router = express.Router();

// route untuk menambah item baru
router.post(
  "/",
  // user harus login terlebih dahulu
  isAuthenticated,
  // route ini hanya bisa digunakan oleh admin, maka middleware ini mencegah !admin mengaksesnya
  verifyRole,
  // middleware ini memeriksa apakah req.body yang dikirimkan memiliki keys yang dibutuhkan untuk suatu item
  // bisa dibuat, jika kekurangan property/key maka akan memberikan response error
  reqBodyCheckKeys,
  async (req, res) => {
    // mengambil data dari request body untuk disimpan ke database
    const { id_brand, id_category, name, stock, price } = req.body;

    try {
      // menyimpan data ke database
      const returnData = await prisma.items.create({
        data: {
          id_brand,
          id_category,
          name,
          stock,
          price,
          rating: null,
        },
      });
      // memberikan response berhasil beserta dengan datanya
      return res.json({
        ...success("Berhasil membuat items baru"),
        data: returnData,
      });
    } catch (err) {
      console.log(err);
      return prismaErrorResponse(res, err);
    } finally {
      await prisma.$disconnect();
    }
  }
);

// route ini digunakan untuk mengambil semua item tanpa syarat apapun
router.get("/get-all", async (req, res) => {
  try {
    const data = await prisma.items.findMany({
      include: {
        category: { select: { category: true } },
        brand: { select: { name_brand: true } },
      },
    });
    let returnData = data.map((d) => {
      return { ...d, category: d.category.category, brand: d.brand.name_brand };
    });
    return res.json({
      ...success("Berhasil mengambil data"),
      data: itemBlobsToImages(returnData),
    });
  } catch (err) {
    console.log(err);
    return prismaErrorResponse(res, err);
  } finally {
    await prisma.$disconnect();
  }
});

// route ini digunakan untuk pencarian barang dengan filter
router.post("/search", async (req, res) => {
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
  } finally {
    await prisma.$disconnect();
  }
});

// route ini digunakan untuk edit detail barang
router.patch(
  "/edit-item",
  // isAuthenticated,
  // verifyRole,
  // parsing photo_item sehingga file bisa diakses di req.file
  multer().single("photo_item"),
  // mengecek apakah ada key/property yang diperlukan untuk melanjutkan aksi update
  reqBodyCheckIsThereKey,
  async (req, res) => {
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
    } finally {
      await prisma.$disconnect();
    }
  }
);

export default router;

