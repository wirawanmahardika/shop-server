import { DataTypes } from "sequelize";
import { sequelize } from "../configs/database.js";

const Preview = sequelize.define(
  "Preview",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipe_barang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_barang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.BLOB("medium"),
      allowNull: false,
    },
  },
  {
    tableName: "preview",
    timestamps: false,
  }
);

export default Preview;
