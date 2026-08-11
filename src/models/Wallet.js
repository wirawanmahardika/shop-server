import { DataTypes } from "sequelize";
import { sequelize } from "../configs/database.js";

const Wallet = sequelize.define(
  "Wallet",
  {
    id_wallet: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true,
    },
    balance: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "wallet",
    timestamps: false,
  }
);

export default Wallet;
