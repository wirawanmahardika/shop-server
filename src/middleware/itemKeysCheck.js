import { error } from "../utils/response.js";

export function reqBodyCheckKeys(req, res, next) {
  // property yang perlu dimiliki oleh semua item
  const everyItemShouldHave = [
    "id_brand",
    "id_category",
    "name",
    "price",
    "stock",
    "rating",
  ];
  let data = req.body;
  let allowed = true;

  if (!data) {
    return res
      .status(403)
      .json({ ...error(403, "membutuhkan data item untuk disimpan") });
  }
  console.log(data);
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
  console.log(data);
  if (Object.keys(data).length > 0 && data.id_item) {
    req.body.id_item = parseInt(req.body.id_item);
    return next();
  }
  return res.status(403).json({
    ...error(403, "membutuhkan data item untuk diupdate"),
  });
}
