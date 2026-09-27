const {status} = require("http-status");
const catchAsync = require("../utils/catchAsync");
const {expenseService} = require("../services");

const addExpense = catchAsync(async (req, res) => {
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
    const { period, page, startDate, endDate, limit } = req.query;
    const result = await expenseService.getExpenses(req.userId, {
        period,
        page: parseInt(page) || 1,
        startDate,
        endDate,
        limit: limit ? parseInt(limit) : undefined,
    });
    res.status(status.OK).json(result);
});

const getDailyTotals = catchAsync(async (req, res) => {
    const { startDate, endDate, tz } = req.query;
    const totals = await expenseService.getDailyTotals(req.userId, { startDate, endDate, tz });
    res.status(status.OK).json(totals);
});

module.exports = { addExpense, editExpense, deleteExpense, getExpenses, getDailyTotals };
