const { Expense } = require("../models");
const { googleApiKey } = require("../config/config");
const { GoogleGenAI } = require("@google/genai");
const { parseExpensePrompt } = require("../config/prompts");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const categoryService = require("./category.service");
const rateService = require("./rate.service");
const logger = require("../config/logger");
const ai = new GoogleGenAI({ apiKey: googleApiKey });

const addExpense = async (expense, userId) => {
    const newExpense = await Expense.create({
        ...expense,
        userId,
    });

    const prompt = parseExpensePrompt(expense.userDescription);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    const expenseObject = JSON.parse(
        response.text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()
    );

    logger.info(
        `[${newExpense._id}] AI response: ${JSON.stringify(expenseObject)}`
    );

    if (
        !expenseObject ||
        !expenseObject.amount ||
        !expenseObject.currency ||
        !expenseObject.title ||
        !expenseObject.category
    ) {
        throw new ApiError(status.BAD_REQUEST, "Invalid expense format");
    }

    newExpense.amount = expenseObject.amount;
    newExpense.currency = expenseObject.currency;
    newExpense.title = expenseObject.title;

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

    newExpense.category = category._id;

    const convertedAmount = await rateService.convertAmount(
        expenseObject.amount,
        expenseObject.currency
    );
    newExpense.defaultCurrencyAmount = convertedAmount;
    newExpense.defaultCurrency = "USD";

    await newExpense.save();

    const expenseWithCategory = await Expense.findById(newExpense._id).populate(
        "category"
    );

    return expenseWithCategory;
};

const getExpenses = async (userId) => {
    const expenses = await Expense.find({ userId })
        .populate("category")
        .sort({ createdAt: -1 });
    return expenses;
};

const editExpense = async (expenseId, expense) => {
    const currentExpense = await Expense.findById(expenseId);
    if (
        currentExpense.amount !== expense.amount ||
        currentExpense.currency !== expense.currency
    ) {
        const convertedAmount = await rateService.convertAmount(
            expense.amount,
            expense.currency
        );
        expense.defaultCurrencyAmount = convertedAmount;
        await currentExpense.save();
    }
    const updatedExpense = await Expense.findByIdAndUpdate(expenseId, expense, {
        new: true,
    }).populate("category");
    return updatedExpense;
};

const deleteExpense = async (expenseId) => {
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);
    return deletedExpense;
};

const addManualExpense = async (expenseData, userId) => {
    const { title, amount, currency, category, createdAt } = expenseData;

    const convertedAmount = await rateService.convertAmount(amount, currency);

    const expense = await Expense.create({
        title,
        amount,
        currency,
        category,
        userDescription: title,
        userId,
        defaultCurrencyAmount: convertedAmount,
        defaultCurrency: "USD",
        createdAt: createdAt,
    });

    return Expense.findById(expense._id).populate("category");
};

module.exports = {
    addExpense,
    getExpenses,
    editExpense,
    deleteExpense,
    addManualExpense,
};
