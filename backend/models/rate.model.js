const { Schema, model } = require("mongoose");

const rateSchema = Schema(
    {
        rates: {
            type: Map,
            of: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Rate = model("Rate", rateSchema);

module.exports = Rate;
