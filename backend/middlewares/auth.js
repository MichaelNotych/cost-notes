const { jwtSecret } = require("../config/config");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
	return new Promise((resolve, reject) => {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token)
			return reject(
				new ApiError(status['UNAUTHORIZED'], "Invalid authorization credits")
			);
		let decoded = null;
		try {
			decoded = jwt.verify(token, jwtSecret);
		} catch (error) {
			decoded = null;
		}
		if (!decoded || !decoded.userId)
			return reject(
				new ApiError(status['UNAUTHORIZED'], "Invalid authorization credits")
			);
		req.userId = decoded.userId;
		resolve();
	})
		.then(() => next())
		.catch((error) => next(error));
};

module.exports = {
	auth
};