const Joi = require('joi');
const addExpenseSchema = {
  body: Joi.object().keys({
    userDescription: Joi.string().required(),
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
