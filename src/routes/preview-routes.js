import express from "express";
import { Preview } from "../app/database.js";
import { sequelizeErrorResponse, success } from "../utils/response.js";
import multer from "multer";

const previewRoutes = express.Router();

previewRoutes.post("/", multer().single("image"), async (req, res) => {
  try {
    await Preview.create({
      ...req.body,
      image: req.file.buffer,
    });

    return res.json(success("Berhasil menambah barang untuk preview", 201));
  } catch (err) {
    console.log(err);
    return sequelizeErrorResponse(res, err);
  }
});

previewRoutes.get("/:category", async (req, res) => {
  try {
    const previewRecords = await Preview.findAll({
      limit: 5,
      where: {
        tipe_barang: req.params.category,
      },
      attributes: ["image"],
    });

    const data = previewRecords.map((p) => p.toJSON());

    return res.json({
      ...success("Berhasil mengambil data untuk preview"),
      data: data.map((d) => {
        return `data:image/png;base64,` + Buffer.from(d.image).toString("base64");
      }),
    });
  } catch (err) {
    console.log(err);
    return sequelizeErrorResponse(res, err);
  }
});

export default previewRoutes;
