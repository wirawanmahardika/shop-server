import { DataTypes } from "sequelize";
import { sequelize } from "../configs/database.js";

const ItemTerjual = sequelize.define(
  "ItemTerjual",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_penjualan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_item: {
      type: DataTypes.MEDIUMINT.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "item_terjual",
    timestamps: false,
  }
);

export default ItemTerjual;
