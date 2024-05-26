import { prisma } from "../app/prisma.js";
import { error } from "../utils/response.js";
import emailValidator from "email-validator";
import bcrypt from "bcrypt";

export function reqBodyCheckKeys(req, res, next) {
  // property yang perlu dimiliki oleh semua item
  const everyItemShouldHave = [
    "id_brand",
    "id_category",
    "name",
    "price",
    "stock",
  ];
  let data = req.body;
  let allowed = true;

  if (!data) {
    return res
      .status(403)
      .json({ ...error(403, "membutuhkan data item untuk disimpan") });
  }
  for (const itemProperty of everyItemShouldHave) {
    if (!Object.keys(data).includes(itemProperty)) {
      allowed = false;
      break;
    }
  }
  if (!allowed) {
    return res
      .status(403)
      .json({ ...error(403, "Ada data yang kekurangan property") });
  }
  return next();
}

export function reqBodyCheckIsThereKey(req, res, next) {
  const data = req.body;
  if (Object.keys(data).length > 0 && data.id_item) {
    req.body.id_item = parseInt(req.body.id_item);
    return next();
  }
  return res.status(403).json({
    ...error(403, "membutuhkan data item untuk diupdate"),
  });
}

export async function editBioRouteCheckKeys(req, res, next) {
  const { email, username, fullname, password } = req.body;
  if (!email || !username || !fullname || !password) {
    return res.status(403).json({
      ...error(403, "Lengkapi semua data yang diperlukan"),
      place: "top",
    });
  }

  if (!emailValidator.validate(email)) {
    return res
      .status(403)
      .json({ ...error(403, "Email is not valid"), place: "email" });
  }

  if (username.length < 6) {
    return res.status(403).json({
      ...error(403, "Username Character shouldn't be less than 6"),
      place: "username",
    });
  }
  if (username.length > 20) {
    return res.status(403).json({
      ...error(403, "Username Character shouldn't be higher than 20"),
      place: "username",
    });
  }

  try {
    const user = await prisma.users.findUnique({ where: { id: req.user.id } });
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        ...error(401, "Wrong password"),
        place: "password",
      });
    }
    return next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ ...error(500, "Something went wrong") });
  } finally {
    await prisma.$disconnect();
  }
}
