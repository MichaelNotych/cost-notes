const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");

const generateToken = (userId) => {
	return jwt.sign(
		{
			userId,
		},
		jwtSecret,
		{
			expiresIn: "7d",
		}
	);
};

const validateToken = (token) => {
	return jwt.verify(token, jwtSecret);
};

module.exports = {
	generateToken,
	validateToken,
};
