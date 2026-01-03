const { Schema, model } = require("mongoose");

const expenseSchema = Schema(
    {
        userDescription: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: false,
        },
        amount: {
            type: String,
            required: false,
        },
        currency: {
            type: String,
            required: false,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: false,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        defaultCurrencyAmount: {
            type: Number,
            required: false,
        },
        defaultCurrency: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

const Expense = model("Expense", expenseSchema);

module.exports = Expense;
