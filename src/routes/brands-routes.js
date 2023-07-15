import express from "express";
import { prisma } from "../database/prisma-client.js";
import multer from "multer";
import { verifyRole } from "../middleware/role-verify.js";
import { success } from "../utils/response.js";
import { isAuthenticated } from "../middleware/passport-middleware.js";

const router = express.Router();

router.post(
  "/",
  // user harus login sebelum bisa menbambah brand baru
  isAuthenticated,
  // user harus merupakan admin jika ingin menambah brand baru
  verifyRole,
  // middleware ini digunakan untuk memparsing blob buffer
  multer().single("image"),
  async (req, res) => {
    // mengambil name_brand dari req.body agar bisa menambah brand baru dengan data tersebut
    const { name_brand } = req.body;

    try {
      // menambah brand baru dan dimasukkan hasil query brand yang sudah dicreate tadi
      const data = await prisma.brands.create({
        data: { name_brand, brand_photo: req.file.buffer },
      });
      // mengganti brand_photo agar brand_photo aslinya tidak jadi diambil karena terlalu besar
      data.brand_photo = "inserted";
      // mengirim response success beserta data yang sudah berhasil dicreate
      return res.json({
        ...success("Berhasil menambah brand baru"),
        data: data,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Something went wrong while trying to create new brands");
    } finally {
      await prisma.$disconnect();
    }
  }
);

router.get("/", async (req, res) => {
  // mengambil brand dari query
  const brand = req.query.brand;
  // digunakan untuk memberi response
  let response;
  try {
    // mencari beberapa brand jika mungkin dengan menggunakan syarat yang telah ditentukan
    const data = await prisma.brands.findMany({
      where: {
        name_brand: {
          contains: brand,
        },
      },
      select: {
        id_brand: true,
        name_brand: true,
      },
    });
    // jika dtemukan data yang sesuai dengan syarat maka response description berupa
    // "Berhasil menambah brand baru"
    if (data.length > 0) {
      // menyimpan response ke variable response
      response = {
        ...success("Berhasil menambah brand baru"),
        data: data,
      };
      // jika tidak itemukan data yang sesuai dengan syarat maka response description berupa
      // "Brand tidak ditemukan"
    } else {
      // menyimpan response ke variable response
      response = {
        ...success("Brand tidak ditemukan"),
        data: data,
      };
    }
    return res.json(response);
  } catch (error) {
    console.log(error);
    throw new Error("Gagal mengambil data");
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
