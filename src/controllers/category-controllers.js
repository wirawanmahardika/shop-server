import { prisma } from "../database/prisma-client.js";
import { prismaErrorResponse, success } from "../utils/response.js";
import dotenv from "dotenv";

dotenv.config();

const getCategories = async (req, res) => {
  const category = req.query.category;
  let response;
  try {
    const data = await prisma.categories.findMany({
      where: {
        category: {
          contains: category,
        },
      },
      select: {
        category: true,
        id_category: true,
      },
    });

    if (data.length > 0) {
      response = {
        ...success("Berhasil mengambil category"),
        data: data.map((d) => {
          d.category_photo =
            process.env.SERVER_URL + "/api/category/image/" + d.id_category;
          return d;
        }),
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
  }
};

const createNewCategory = async (req, res) => {
  const { category } = req.body;
  try {
    const data = await prisma.categories.create({
      data: { category, category_photo: req.file?.buffer },
      select: {
        id_category: true,
        category: true,
      },
    });
    return res.json({
      ...success("Berhasil membuat kategori baru"),
      data: data,
    });
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  }
};

const editPhoto = async (req, res) => {
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
  }
};

const deleteCategory = async (req, res) => {
  const id_category = req.params.id_category;

  try {
    const data = await prisma.categories.delete({
      where: { id_category: parseInt(id_category) },
    });
    return res.json({
      ...success("Berhasil menghapus category " + data.category),
    });
  } catch (err) {
    console.log(err);
    return prismaErrorResponse(res, err);
  } finally {
    await prisma.$disconnect();
  }
};

const getCategoryImage = async (req, res) => {
  const id_category = req.params.id_category
    ? parseInt(req.params.id_category)
    : 0;
  const result = await prisma.categories.findUnique({
    where: { id_category: id_category },
    select: {
      category_photo: true,
    },
  });

  res.set("Content-Type", "image/jpeg");
  return res.send(result.category_photo);
};

export default {
  getCategories,
  createNewCategory,
  editPhoto,
  deleteCategory,
  getCategoryImage,
};
