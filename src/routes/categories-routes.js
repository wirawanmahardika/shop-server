import express from "express";
import { prisma } from "../database/prisma-client.js";
import { success } from "../utils/response.js";
import { isAuthenticated } from "../middleware/passport-middleware.js";
import { verifyRole } from "../middleware/role-verify.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const category = req.query.category;
  try {
    const data = await prisma.categories.findMany({
      where: {
        category: {
          contains: category,
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

router.post("/", isAuthenticated, verifyRole, async (req, res) => {
  const { category } = req.body;
  try {
    const data = await prisma.categories.create({ data: { category } });
    return res.json({
      ...success("Berhasil membuat kategori baru"),
      data: data,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong while trying to create new category");
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
