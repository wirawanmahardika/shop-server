import express from "express";
import { prisma } from "../database/prisma-client.js";
import { error, prismaErrorResponse, success } from "../utils/response.js";
import { isAuthenticated } from "../middleware/passport-middleware.js";
import { verifyRole } from "../middleware/role-verify.js";
import multer from "multer";
import { categoryBlobsToImages } from "../utils/blobToImage.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const category = req.query.category;
  let response;
  try {
    const data = await prisma.categories.findMany({
      where: {
        category: {
          contains: category,
        },
      },
    });

    if (data.length > 0) {
      response = {
        ...success("Berhasil mengambil category"),
        data: categoryBlobsToImages(data),
      };
    } else {
      response = {
        ...success("Category tidak ditemukan"),
        data: data,
      };
    }

    return res.json(response);
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
});

router.post(
  "/",
  isAuthenticated,
  verifyRole,
  multer().single("image"),
  async (req, res) => {
    const { category } = req.body;
    try {
      const data = await prisma.categories.create({
        data: { category, category_photo: req.file?.buffer },
      });
      return res.json({
        ...success("Berhasil membuat kategori baru"),
        data: data,
      });
    } catch (error) {
      console.log(error);
      return prismaErrorResponse(res, error);
    } finally {
      await prisma.$disconnect();
    }
  }
);

router.patch(
  "/edit-category",
  isAuthenticated,
  verifyRole,
  multer().single("photo"),
  async (req, res) => {
    const { id_category } = req.body;
    try {
      const returnData = await prisma.categories.update({
        where: { id_category: parseInt(id_category) },
        data: {
          category_photo: req.file.buffer,
        },
      });
      return res.json({
        ...success("Berhasil update kategori " + returnData.category),
      });
    } catch (err) {
      console.log(err);
      return prismaErrorResponse(res, err);
    } finally {
      await prisma.$disconnect();
    }
  }
);

router.delete(
  "/:id_category",
  isAuthenticated,
  verifyRole,
  async (req, res) => {
    const id_category = req.query.id_category;

    try {
      const data = await prisma.categories.delete({ where: { id_category } });
      return res.json({
        ...success("Berhasil menghapus category " + data.category),
      });
    } catch (err) {
      return prismaErrorResponse(res, err);
    } finally {
      await prisma.$disconnect();
    }
  }
);

export default router;
