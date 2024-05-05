import express from "express";
import { prisma } from "../../database/prisma-client.js";
import { prismaErrorResponse, success } from "../../utils/response.js";
import multer from "multer";

const previewRoutes = express.Router();

previewRoutes.post("/", multer().single("image"), async (req, res) => {
    try {
        await prisma.preview.create({
            data: { ...req.body, image: req.file.buffer },
        });

        return res.json(success("Berhasil menambah barang untuk preview", 201));
    } catch (error) {
        console.log(error);
        return prismaErrorResponse(res, err);
    }
});

previewRoutes.get("/:category", async (req, res) => {
    try {
        const data = await prisma.preview.findMany({
            take: 5,
            where: {
                tipe_barang: req.params.category,
            },
            select: {
                image: true,
            },
        });

        return res.json({
            ...success("Berhasil mengambil data untuk preview"),
            data: data.map((d) => {
                return `data:image/png;base64,` + d.image.toString("base64");
            }),
        });
    } catch (error) {
        console.log(error);
        return prismaErrorResponse(res, error);
    }
});

export default previewRoutes;
