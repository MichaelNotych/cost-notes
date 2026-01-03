const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const { expenseValidation } = require("../validations");
const { expenseController } = require("../controllers");
const { auth } = require("../middlewares/auth");

router.post(
  "/expense",
  auth,
  validate(expenseValidation.addExpenseSchema),
  expenseController.addExpense
);

router.put(
  "/expense/:id",
  auth,
  validate(expenseValidation.editExpenseSchema),
  expenseController.editExpense
);

router.delete(
  "/expense/:id",
  auth,
  expenseController.deleteExpense
);

router.get(
  "/expenses",
  auth,
  expenseController.getExpenses
);

module.exports = router;