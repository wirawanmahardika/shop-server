import { DataTypes } from "sequelize";
import { sequelize } from "../configs/database.js";

const Brand = sequelize.define(
  "Brands",
  {
    id_brand: {
      type: DataTypes.MEDIUMINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name_brand: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    brand_photo: {
      type: DataTypes.BLOB("medium"),
      allowNull: true,
    },
  },
  {
    tableName: "brands",
    timestamps: false,
  }
);

export default Brand;
