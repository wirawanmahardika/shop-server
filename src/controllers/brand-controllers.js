import logger from "../app/logger.js";
import { Brand } from "../app/database.js";
import { sequelizeErrorResponse, success, error } from "../utils/response.js";
import { Op } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const addBrand = async (req, res) => {
  const { name_brand } = req.body;

  try {
    const brandRecord = await Brand.create({
      name_brand: name_brand,
      brand_photo: req.file?.buffer,
    });
    const data = brandRecord.toJSON();
    data.brand_photo = "inserted";
    return res.json({
      ...success("Berhasil menambah brand baru"),
      data: data,
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const getBrandsBasedOnQuery = async (req, res) => {
  const brand = req.query.brand;
  let response;
  try {
    const whereClause = brand
      ? { name_brand: { [Op.like]: `%${brand}%` } }
      : {};

    const brandRecords = await Brand.findAll({
      where: whereClause,
      attributes: ["id_brand", "name_brand"],
    });

    const data = brandRecords.map((b) => b.toJSON());

    if (data.length > 0) {
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
    } else {
      response = {
        ...success("Brand tidak ditemukan"),
        data: data,
      };
    }
    return res.json(response);
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const editBrand = async (req, res) => {
  const { id_brand, name_brand } = req.body;
  try {
    const idBrand = id_brand ? parseInt(id_brand) : 0;
    const countBrand = await Brand.count({
      where: { id_brand: idBrand },
    });
    if (countBrand === 0) {
      res.status(403).send("brand yang ingin diedit tidak ditemukan");
      return;
    }

    await Brand.update(
      { brand_photo: req.file.buffer, name_brand: name_brand },
      { where: { id_brand: idBrand } }
    );

    res.json({ ...success("Berhasil mengupdate data " + name_brand) });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const deleteBrand = async (req, res) => {
  const id_brand = req.params.id_brand;

  try {
    const idBrand = id_brand ? parseInt(id_brand) : 0;
    const brandRecord = await Brand.findByPk(idBrand);
    if (!brandRecord) {
      return res.status(404).json({ ...error(404, "Brand tidak ditemukan") });
    }
    const data = brandRecord.toJSON();
    await Brand.destroy({
      where: { id_brand: idBrand },
    });
    return res.json({
      ...success("Berhasil menghapus brand " + data.name_brand),
    });
  } catch (err) {
    logger.error(err);
    return sequelizeErrorResponse(res, err);
  }
};

const getBrandImage = async (req, res) => {
  try {
    const idBrand = req.params.id_brand ? parseInt(req.params.id_brand) : 0;
    const result = await Brand.findOne({
      where: { id_brand: idBrand },
      attributes: ["brand_photo"],
    });

    res.set("Content-Type", "image/jpeg");
    return res.send(result ? result.brand_photo : null);
  } catch (err) {
    logger.error(err);
    res.status(500);
    res.send("something went wrong");
  }
};

const getTotalBrand = async (req, res) => {
  try {
    const result = await Brand.count();
    res.send(result.toString());
  } catch (err) {
    logger.error(err);
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
