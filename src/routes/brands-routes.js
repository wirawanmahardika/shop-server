import express from "express";
import { prisma } from "../database/prisma-client.js";
import multer from "multer";
import { verifyRole } from "../middleware/role-verify.js";
import { success } from "../utils/response.js";

const router = express.Router();

router.post("/", verifyRole, multer().single("image"), async (req, res) => {
  const { name_brand } = req.body;
  try {
    const data = await prisma.brands.create({
      data: { name_brand, brand_photo: req.file.buffer },
    });
    return res.json({
      ...success("Berhasil membuat menambah brand baru"),
      data: data,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong while trying to create new brands");
  } finally {
    await prisma.$disconnect();
  }
});

router.get("/", async (req, res) => {
  const brand = req.query.brand;
  try {
    const data = await prisma.brands.findMany({
      where: {
        name_brand: {
          contains: brand,
        },
      },
    });
    return res.json({ ...success("Berhasil mengambil kategori"), data: data });
  } catch (error) {
    console.log(error);
    throw new Error("Gagal mengambil data");
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
