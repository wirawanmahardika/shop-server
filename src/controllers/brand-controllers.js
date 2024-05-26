import logger from "../app/logger.js";
import { prisma } from "../app/prisma.js";
import { prismaErrorResponse, success } from "../utils/response.js";
import dotenv from "dotenv";
dotenv.config();

const addBrand = async (req, res) => {
  // mengambil name_brand dari req.body agar bisa menambah brand baru dengan data tersebut
  const { name_brand } = req.body;

  try {
    // menambah brand baru dan dimasukkan hasil query brand yang sudah dicreate tadi
    const data = await prisma.brands.create({
      data: { name_brand: name_brand, brand_photo: req.file?.buffer },
    });
    // mengganti brand_photo agar brand_photo aslinya tidak jadi diambil karena terlalu besar
    data.brand_photo = "inserted";
    // mengirim response success beserta data yang sudah berhasil dicreate
    return res.json({
      ...success("Berhasil menambah brand baru"),
      data: data,
    });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const getBrandsBasedOnQuery = async (req, res) => {
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
        data: data.map((d) => {
          return {
            ...d,
            brand_photo:
              process.env.SERVER_URL + "/api/brands/image/" + d.id_brand,
          };
        }),
      };
      // jika tidak ditemukan data yang sesuai dengan syarat maka response description berupa
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
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const editBrand = async (req, res) => {
  const { id_brand, name_brand } = req.body;
  try {
    const idBrand = id_brand ? parseInt(id_brand) : 0;
    const countBrand = await prisma.brands.count({
      where: { id_brand: idBrand },
    });
    if (countBrand === 0) {
      res.status(403).send("brand yang ingin diedit tidak ditemukan");
      return;
    }

    const data = await prisma.brands.update({
      where: {
        id_brand: idBrand,
      },
      data: { brand_photo: req.file.buffer, name_brand: name_brand },
    });

    res.json({ ...success("Berhasil mengupdate data " + data.name_brand) });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const deleteBrand = async (req, res) => {
  const id_brand = req.params.id_brand;

  try {
    const data = await prisma.brands.delete({
      where: { id_brand: id_brand && parseInt(id_brand) },
    });
    return res.json({
      ...success("Berhasil menghapus brand " + data.name_brand),
    });
  } catch (error) {
    logger.error(error);
    return prismaErrorResponse(res, error);
  }
};

const getBrandImage = async (req, res) => {
  try {
    const idBrand = req.params.id_brand ? parseInt(req.params.id_brand) : 0;
    const result = await prisma.brands.findUnique({
      where: { id_brand: idBrand },
      select: {
        brand_photo: true,
      },
    });

    res.set("Content-Type", "image/jpeg");
    return res.send(result.brand_photo);
  } catch (error) {
    logger.error(error);
    res.status(500);
    res.send("something went wrong");
  }
};

const getTotalBrand = async (req, res) => {
  try {
    const result = await prisma.brands.count();
    res.send(result.toString());
  } catch (error) {
    logger.error(error);
    res.status(500).send("Something went wrong");
  }
};

export default {
  addBrand,
  getBrandsBasedOnQuery,
  editBrand,
  deleteBrand,
  getBrandImage,
  getTotalBrand,
};
