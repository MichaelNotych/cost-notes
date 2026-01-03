const {status} = require("http-status");
const catchAsync = require("../utils/catchAsync");
const {expenseService} = require("../services");

const addExpense = catchAsync(async (req, res) => {
    console.log(req.body, req.userId)
    const expense = await expenseService.addExpense(req.body, req.userId);
    res.status(status.CREATED).json(expense);
});

const editExpense = catchAsync(async (req, res) => {
    const expense = await expenseService.editExpense(req.params.id, req.body);
    res.status(status.OK).json(expense);
});

const deleteExpense = catchAsync(async (req, res) => {
    const expense = await expenseService.deleteExpense(req.params.id);
    res.status(status.OK).json(expense);
});

const getExpenses = catchAsync(async (req, res) => {
    const expenses = await expenseService.getExpenses(req.userId);
    res.status(status.OK).json(expenses);
});

module.exports = { addExpense, editExpense, deleteExpense, getExpenses };