const Joi = require('joi');

const addExpenseSchema = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    amount: Joi.number().required(),
    currency: Joi.string().required(),
    category: Joi.string().required(),
    createdAt: Joi.date().optional(),
  }),
};

const editExpenseSchema = {
  body: Joi.object().keys({
    title: Joi.string().optional(),
    amount: Joi.number().optional(),
    currency: Joi.string().optional(),
    category: Joi.string().optional(),
  }),
};

module.exports = {
  addExpenseSchema,
  editExpenseSchema,
};
