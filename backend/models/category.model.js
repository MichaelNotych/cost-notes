const {Schema, model} = require("mongoose");

const categorySchema = Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    emoji: {
        type: String,
        required: true,
        default: "🏷️"
    },
}, { timestamps: true });

const Category = model("Category", categorySchema);

module.exports = Category;
