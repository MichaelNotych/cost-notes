const express = require('express');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { categoryValidation } = require('../validations');
const { categoryController } = require('../controllers');

const router = express.Router();

router.post(
    '/category',
    auth,
    validate(categoryValidation.createCategory),
    categoryController.createCategory
);

router.get(
    '/categories',
    auth,
    categoryController.getCategories
);

router
    .route('/category/:categoryId')
    .get(
        auth,
        validate(categoryValidation.getCategory),
        categoryController.getCategory
    )
    .patch(
        auth,
        validate(categoryValidation.updateCategory),
        categoryController.updateCategory
    )
    .delete(
        auth,
        validate(categoryValidation.deleteCategory),
        categoryController.deleteCategory
    );

module.exports = router;
