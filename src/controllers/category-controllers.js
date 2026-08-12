import logger from '../app/logger.js';
import { Category } from '../app/database.js';
import { sequelizeErrorResponse, success, error } from '../utils/response.js';
import { Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const getCategories = async (req, res) => {
    const category = req.query.category;
    let response;
    try {
        const whereClause = category ? { category: { [Op.like]: `%${category}%` } } : {};

        const categoryRecords = await Category.findAll({
            where: whereClause,
            attributes: ['category', 'id_category'],
        });

        const data = categoryRecords.map((c) => c.toJSON());

        if (data.length > 0) {
            response = {
                ...success('Berhasil mengambil category'),
                data: data.map((d) => {
                    d.category_photo =
                        process.env.SERVER_URL + '/api/category/image/' + d.id_category;
                    return d;
                }),
            };
        } else {
            response = {
                ...success('Category tidak ditemukan'),
                data: data,
            };
        }

        return res.json(response);
    } catch (err) {
        logger.error(err);
        return sequelizeErrorResponse(res, err);
    }
};

const createNewCategory = async (req, res) => {
    const { category } = req.body;
    try {
        const newCat = await Category.create({
            category,
            category_photo: req.file?.buffer,
        });
        const data = {
            id_category: newCat.id_category,
            category: newCat.category,
        };
        return res.json({
            ...success('Berhasil membuat kategori baru'),
            data: data,
        });
    } catch (err) {
        logger.error(err);
        return sequelizeErrorResponse(res, err);
    }
};

const editCategory = async (req, res) => {
    const { id_category, category } = req.body;
    try {
        const idCategory = id_category ? parseInt(id_category) : 0;
        const countCategory = await Category.count({
            where: { id_category: idCategory },
        });

        if (countCategory === 0) {
            res.status(403).send('Category yang ingin diedit tidak ditemukan');
            return;
        }

        await Category.update(
            {
                category_photo: req.file.buffer,
                category: category,
            },
            { where: { id_category: idCategory } }
        );
        return res.json({
            ...success('Berhasil update kategori ' + category),
        });
    } catch (err) {
        logger.error(err);
        return sequelizeErrorResponse(res, err);
    }
};

const deleteCategory = async (req, res) => {
    const id_category = req.params.id_category;

    try {
        const idCategory = id_category ? parseInt(id_category) : 0;
        const catRecord = await Category.findByPk(idCategory);
        if (!catRecord) {
            return res.status(404).json({ ...error(404, 'Category tidak ditemukan') });
        }
        const data = catRecord.toJSON();
        await Category.destroy({
            where: { id_category: idCategory },
        });
        return res.json({
            ...success('Berhasil menghapus category ' + data.category),
        });
    } catch (err) {
        logger.error(err);
        return sequelizeErrorResponse(res, err);
    }
};

const getCategoryImage = async (req, res) => {
    try {
        const id_category = req.params.id_category ? parseInt(req.params.id_category) : 0;
        const result = await Category.findOne({
            where: { id_category: id_category },
            attributes: ['category_photo'],
        });

        res.set('Content-Type', 'image/png');
        return res.send(result ? result.category_photo : null);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Something went wrong');
    }
};

const getTotalCategory = async (req, res) => {
    try {
        const result = await Category.count();
        return res.send(result.toString());
    } catch (err) {
        logger.error(err);
        res.status(500).send('Something went wrong');
    }
};

export default {
    getCategories,
    createNewCategory,
    editCategory,
    deleteCategory,
    getCategoryImage,
    getTotalCategory,
};
