const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true,
		index: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
