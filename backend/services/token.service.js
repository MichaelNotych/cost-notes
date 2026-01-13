const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");
const { Token } = require("../models");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");

/**
 * Generate access token (short-lived, 15 minutes)
 */
const generateAccessToken = (userId) => {
	return jwt.sign(
		{
			userId,
			type: "access",
		},
		jwtSecret,
		{
			expiresIn: "15m",
		}
	);
};

/**
 * Generate refresh token (long-lived, 7 days)
 */
const generateRefreshToken = (userId) => {
	return jwt.sign(
		{
			userId,
			type: "refresh",
		},
		jwtSecret,
		{
			expiresIn: "7d",
		}
	);
};

/**
 * Generate both access and refresh tokens
 * Saves refresh token to database and enforces single session
 */
const generateAuthTokens = async (userId) => {
	const accessToken = generateAccessToken(userId);
	const refreshToken = generateRefreshToken(userId);

	// Delete any existing refresh tokens for this user (single session enforcement)
	await Token.deleteMany({ userId });

	// Save new refresh token to database
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

	await Token.create({
		token: refreshToken,
		userId,
		expiresAt,
	});

	return {
		accessToken,
		refreshToken,
	};
};

/**
 * Validate access token
 */
const validateToken = (token) => {
	return jwt.verify(token, jwtSecret);
};

/**
 * Verify refresh token and check if it exists in database
 */
const verifyRefreshToken = async (token) => {
	try {
		const decoded = jwt.verify(token, jwtSecret);

		// Check if token type is refresh
		if (decoded.type !== "refresh") {
			throw new ApiError(status.UNAUTHORIZED, "Invalid token type");
		}

		// Check if token exists in database
		const tokenDoc = await Token.findOne({ token, userId: decoded.userId });
		if (!tokenDoc) {
			throw new ApiError(status.UNAUTHORIZED, "Refresh token not found");
		}

		// Check if token is expired
		if (tokenDoc.expiresAt < new Date()) {
			await Token.deleteOne({ _id: tokenDoc._id });
			throw new ApiError(status.UNAUTHORIZED, "Refresh token expired");
		}

		return decoded;
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(status.UNAUTHORIZED, "Invalid refresh token");
	}
};

/**
 * Refresh auth tokens (with token rotation)
 * 1. Verify old refresh token
 * 2. Delete old refresh token
 * 3. Generate new token pair
 * 4. Save new refresh token
 */
const refreshAuthTokens = async (refreshToken) => {
	// Verify the refresh token
	const decoded = await verifyRefreshToken(refreshToken);

	// Delete the old refresh token (rotation)
	await Token.deleteOne({ token: refreshToken });

	// Generate new token pair
	const tokens = await generateAuthTokens(decoded.userId);

	return tokens;
};

/**
 * Revoke refresh token (for logout)
 */
const revokeRefreshToken = async (userId) => {
	await Token.deleteMany({ userId });
};

module.exports = {
	generateAuthTokens,
	validateToken,
	verifyRefreshToken,
	refreshAuthTokens,
	revokeRefreshToken,
};
