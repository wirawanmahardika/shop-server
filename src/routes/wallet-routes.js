import express from "express";
import { isAuthenticated } from "../middleware/passport-middleware.js";
import { prisma } from "../database/prisma-client.js";
import { prismaErrorResponse, success } from "../utils/response.js";
import { verifyRole } from "../middleware/role-verify.js";

const router = express.Router();

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const data = await prisma.wallet.create({ data: { id_user: req.user.id } });
    return res.json({ ...success("berhasil", 201), data });
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
});

router.get("/user-wallet", isAuthenticated, async (req, res) => {
  try {
    const data = await prisma.wallet.findUnique({
      where: { id_user: req.user.id },
    });
    return res.json({ ...success("Berhasil mengambil data user", data) });
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
});

router.get("/get-all", isAuthenticated, verifyRole, async (req, res) => {
  try {
    const data = await prisma.wallet.findMany({});
    return res.json(data);
  } catch (error) {
    console.log(error);
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
});

router.patch("/", isAuthenticated, verifyRole, async (req, res) => {
  const { balance, id_user } = req.body;

  try {
    const data = await prisma.wallet.update({
      where: { id_user },
      data: { balance },
    });
    return res.json({
      ...success("Berhasil menambah balance pada user " + id_user),
      data,
    });
  } catch (error) {
    return prismaErrorResponse(res, error);
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
