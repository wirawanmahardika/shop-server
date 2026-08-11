import { sequelize } from "../configs/database.js";
import User from "./User.js";
import Wallet from "./Wallet.js";
import Brand from "./Brand.js";
import Category from "./Category.js";
import Item from "./Item.js";
import Penjualan from "./Penjualan.js";
import ItemTerjual from "./ItemTerjual.js";
import Preview from "./Preview.js";

// Define Associations

// User <-> Wallet (1:1)
User.hasOne(Wallet, { foreignKey: "id_user", as: "wallet", onDelete: "CASCADE" });
Wallet.belongsTo(User, { foreignKey: "id_user", as: "user", onDelete: "CASCADE" });

// User <-> Penjualan (1:N)
User.hasMany(Penjualan, { foreignKey: "id_user", as: "penjualan", onDelete: "CASCADE" });
Penjualan.belongsTo(User, { foreignKey: "id_user", as: "users", onDelete: "CASCADE" });

// Category <-> Item (1:N)
Category.hasMany(Item, { foreignKey: "id_category", as: "items", onDelete: "CASCADE" });
Item.belongsTo(Category, { foreignKey: "id_category", as: "category", onDelete: "CASCADE" });

// Brand <-> Item (1:N)
Brand.hasMany(Item, { foreignKey: "id_brand", as: "items", onDelete: "CASCADE" });
Item.belongsTo(Brand, { foreignKey: "id_brand", as: "brand", onDelete: "CASCADE" });

// Penjualan <-> ItemTerjual (1:N)
Penjualan.hasMany(ItemTerjual, { foreignKey: "id_penjualan", as: "item_terjual", onDelete: "CASCADE" });
ItemTerjual.belongsTo(Penjualan, { foreignKey: "id_penjualan", as: "penjualan", onDelete: "CASCADE" });

// Item <-> ItemTerjual (1:N)
Item.hasMany(ItemTerjual, { foreignKey: "id_item", as: "item_terjual", onDelete: "CASCADE" });
ItemTerjual.belongsTo(Item, { foreignKey: "id_item", as: "items", onDelete: "CASCADE" });

export {
  sequelize,
  User,
  Wallet,
  Brand,
  Category,
  Item,
  Penjualan,
  ItemTerjual,
  Preview,
};
