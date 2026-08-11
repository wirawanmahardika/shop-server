import { DataTypes } from "sequelize";
import { sequelize } from "../configs/database.js";

const Item = sequelize.define(
  "Items",
  {
    id_item: {
      type: DataTypes.MEDIUMINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    id_brand: {
      type: DataTypes.MEDIUMINT.UNSIGNED,
      allowNull: false,
    },
    id_category: {
      type: DataTypes.MEDIUMINT.UNSIGNED,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    stock: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
    },
    photo_item: {
      type: DataTypes.BLOB("medium"),
      allowNull: true,
    },
  },
  {
    tableName: "items",
    timestamps: false,
  }
);

export default Item;
