const { Category } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const createCategory = async (categoryBody, userId) => {
    const category = await Category.create({ ...categoryBody, userId });
    return category;
};

const getCategories = async (userId) => {
    const categories = await Category.find({ userId });
    return categories;
};

const getCategoryById = async (id, userId) => {
    return Category.findOne({ _id: id, userId });
};

const getCategoryByName = async (name, userId) => {
    return Category.findOne({ name, userId });
};

const updateCategoryById = async (categoryId, updateBody, userId) => {
    const category = await getCategoryById(categoryId, userId);
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    Object.assign(category, updateBody);
    await category.save();
    return category;
};

const deleteCategoryById = async (categoryId, userId) => {
    const category = await getCategoryById(categoryId, userId);
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    await category.deleteOne();
    return category;
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryByName,
    updateCategoryById,
    deleteCategoryById,
};