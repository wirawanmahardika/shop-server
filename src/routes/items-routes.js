import express from "express";
import { verifyRole } from "../middleware/role-verify.js";
import { isAuthenticated } from "../middleware/passport-middleware.js";
import multer from "multer";
import itemControllers from "../controllers/item-controllers.js";
import {
  reqBodyCheckIsThereKey,
  reqBodyCheckKeys,
} from "../middleware/itemKeysCheck.js";

const router = express.Router();

// route untuk menambah item baru
router.post(
  "/",
  // parsing image
  multer().single("image"),
  // user harus login terlebih dahulu
  isAuthenticated,
  // route ini hanya bisa digunakan oleh admin, maka middleware ini mencegah !admin mengaksesnya
  verifyRole,
  // middleware ini memeriksa apakah req.body yang dikirimkan memiliki keys yang dibutuhkan untuk suatu item
  // bisa dibuat, jika kekurangan property/key maka akan memberikan response error
  reqBodyCheckKeys,
  itemControllers.createNewItem
);

// route ini digunakan untuk mengambil semua item tanpa syarat apapun
router.get("/get-all", itemControllers.getAllItem);

// route ini digunakan untuk pencarian barang dengan filter
router.post("/search", itemControllers.searchItem);

// route ini digunakan untuk edit detail barang
router.patch(
  "/edit-item",
  // isAuthenticated,
  verifyRole,
  // parsing photo_item sehingga file bisa diakses di req.file
  multer().single("photo_item"),
  // mengecek apakah ada key/property yang diperlukan untuk melanjutkan aksi update
  reqBodyCheckIsThereKey,
  itemControllers.editItemDetail
);

router.delete(
  "/:id_item",
  isAuthenticated,
  verifyRole,
  itemControllers.deleteItem
);

router.patch("/buy", isAuthenticated, itemControllers.buyItem);

router.get("/image/:id_item", isAuthenticated, itemControllers.getItemImage);

router.get("/count", isAuthenticated, itemControllers.getTotalItems);

export default router;
