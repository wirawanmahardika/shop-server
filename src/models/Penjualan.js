import { DataTypes } from "sequelize";
import { sequelize } from "../configs/database.js";

const Penjualan = sequelize.define(
  "Penjualan",
  {
    id_penjualan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    tanggal_beli: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pengemasan", "dikirim", "sampai", "diterima"),
      allowNull: false,
    },
  },
  {
    tableName: "penjualan",
    timestamps: false,
  }
);

export default Penjualan;
