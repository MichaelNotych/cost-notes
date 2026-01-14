const { Expense } = require("../models");
const { googleApiKey } = require("../config/config");
const { GoogleGenAI } = require("@google/genai");
const { parseExpensePrompt } = require("../config/prompts");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const categoryService = require("./category.service");
const rateService = require("./rate.service");
const logger = require("../config/logger");
const { parseAiJson } = require("../utils/ai");

const ai = new GoogleGenAI({ apiKey: googleApiKey });

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
 * Add an expense by parsing user description with AI.
 */
const addExpense = async (expense, userId) => {
    const prompt = parseExpensePrompt(expense.userDescription);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const expenseObject = parseAiJson(response.text);

    if (
        !expenseObject ||
        !expenseObject.amount ||
        !expenseObject.currency ||
        !expenseObject.title ||
        !expenseObject.category
    ) {
        throw new ApiError(
            status.BAD_REQUEST,
            "Invalid or incomplete AI response"
        );
    }

    logger.info(
        `AI parsing successful for user: ${userId}. Extracted: ${JSON.stringify(
            expenseObject
        )}`
    );

    // Get or create category
    let category = await categoryService.getCategoryByName(
        expenseObject.category,
        userId
    );
    if (!category) {
        category = await categoryService.createCategory(
            { name: expenseObject.category },
            userId
        );
    }

    return _saveExpenseRecord(
        {
            ...expenseObject,
            category: category._id,
            userDescription: expense.userDescription,
        },
        userId
    );
};

/**
 * Get all expenses for a user.
 */
const getExpenses = async (userId) => {
    return Expense.find({ userId })
        .populate("category")
        .sort({ createdAt: -1 });
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
 * Add an expense manually with pre-filled details.
 */
const addManualExpense = async (expenseData, userId) => {
    return _saveExpenseRecord(expenseData, userId);
};

module.exports = {
    addExpense,
    getExpenses,
    editExpense,
    deleteExpense,
    addManualExpense,
};
