import { DataTypes } from "sequelize";
import { sequelize } from "../configs/database.js";

const Category = sequelize.define(
  "Categories",
  {
    id_category: {
      type: DataTypes.MEDIUMINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_photo: {
      type: DataTypes.BLOB("medium"),
      allowNull: true,
    },
  },
  {
    tableName: "categories",
    timestamps: false,
  }
);

export default Category;
