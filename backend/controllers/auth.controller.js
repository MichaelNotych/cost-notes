const { status } = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { authService, userService, tokenService } = require("../services");

const register = catchAsync(async (req, res) => {
	const user = await userService.createUser(req.body);
	const tokens = await tokenService.generateAuthTokens(user._id);
	res.status(status.CREATED).json({
		user,
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken,
	});
});

const login = catchAsync(async (req, res) => {
	const user = await authService.login(req.body);
	const tokens = await tokenService.generateAuthTokens(user._id);
	res.status(status.OK).json({
		user,
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken,
	});
});

const refreshTokens = catchAsync(async (req, res) => {
	const { refreshToken } = req.body;
	const tokens = await tokenService.refreshAuthTokens(refreshToken);
	res.status(status.OK).json({
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken,
	});
});

const logout = catchAsync(async (req, res) => {
	await tokenService.revokeRefreshToken(req.userId);
	res.status(status.NO_CONTENT).send();
});

module.exports = { register, login, refreshTokens, logout };
