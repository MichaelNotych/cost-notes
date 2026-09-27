const mongoose = require("mongoose");
const { Expense } = require("../models");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const rateService = require("./rate.service");

/**
 * Internal helper to create and save an expense record with currency conversion and population.
 * @private
 */
const _saveExpenseRecord = async (expenseData, userId) => {
    const { amount, currency, title, category, userDescription, createdAt } =
        expenseData;

    const convertedAmount = await rateService.convertAmount(amount, currency);

    const expense = await Expense.create({
        title,
        amount,
        currency,
        category,
        userDescription: userDescription || title,
        userId,
        defaultCurrencyAmount: convertedAmount,
        defaultCurrency: "USD", // TODO: Move to config in point 1
        createdAt: createdAt || new Date(),
    });

    return Expense.findById(expense._id).populate("category");
};

/**
 * Get all expenses for a user with pagination.
 */
const getExpenses = async (userId, { period, page = 1, limit = 100, startDate, endDate } = {}) => {
    const query = { userId };

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    } else if (period) {
        const match = period.match(/^(\d+)([dwmy])$/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            const periodStart = new Date();

            if (unit === 'd') {
                periodStart.setDate(periodStart.getDate() - value);
            } else if (unit === 'w') {
                periodStart.setDate(periodStart.getDate() - (value * 7));
            } else if (unit === 'm') {
                periodStart.setMonth(periodStart.getMonth() - value);
            } else if (unit === 'y') {
                periodStart.setFullYear(periodStart.getFullYear() - value);
            }

            query.createdAt = { $gte: periodStart };
        }
    }

    const skip = (page - 1) * limit;

    const [expenses, totalExpenses] = await Promise.all([
        Expense.find(query)
            .populate("category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Expense.countDocuments(query)
    ]);

    return {
        expenses,
        totalPages: Math.ceil(totalExpenses / limit),
        currentPage: parseInt(page),
        totalExpenses
    };
};

/**
 * Edit an existing expense.
 */
const editExpense = async (expenseId, updateData) => {
    const currentExpense = await Expense.findById(expenseId);
    if (!currentExpense) {
        throw new ApiError(status.NOT_FOUND, "Expense not found");
    }

    // Recalculate conversion if amount or currency changed
    if (
        currentExpense.amount !== updateData.amount ||
        currentExpense.currency !== updateData.currency
    ) {
        updateData.defaultCurrencyAmount = await rateService.convertAmount(
            updateData.amount,
            updateData.currency
        );
    }

    return Expense.findByIdAndUpdate(expenseId, updateData, {
        new: true,
    }).populate("category");
};

/**
 * Delete an expense.
 */
const deleteExpense = async (expenseId) => {
    return Expense.findByIdAndDelete(expenseId);
};

/**
 * Add an expense.
 */
const addExpense = async (expenseData, userId) => {
    return _saveExpenseRecord(expenseData, userId);
};

/**
 * Get per-day expense totals for a date range, grouped by the given timezone's calendar day.
 */
const getDailyTotals = async (userId, { startDate, endDate, tz = "+00:00" } = {}) => {
    const safeTz = /^[+-]\d{2}:\d{2}$/.test(tz) ? tz : "+00:00";
    const match = { userId: new mongoose.Types.ObjectId(userId) };

    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    return Expense.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                        timezone: safeTz,
                    },
                },
                total: { $sum: "$defaultCurrencyAmount" },
            },
        },
        { $project: { _id: 0, date: "$_id", total: 1 } },
    ]);
};

module.exports = {
    addExpense,
    getExpenses,
    getDailyTotals,
    editExpense,
    deleteExpense,
};
