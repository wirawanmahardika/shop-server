import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const dbUrl = 'mysql://root:wirawan123@localhost:3306/shop';

export const sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    logging: false,
    define: {
        timestamps: false,
        freezeTableName: true,
    },
});

export default {
    development: {
        url: dbUrl,
        dialect: 'mysql',
    },
    test: {
        url: dbUrl,
        dialect: 'mysql',
    },
    production: {
        url: dbUrl,
        dialect: 'mysql',
    },
};
