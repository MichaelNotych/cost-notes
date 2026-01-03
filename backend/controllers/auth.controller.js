const { status } = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { authService, userService, tokenService } = require("../services");

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const token = tokenService.generateToken(user._id);
    res.status(status.CREATED).json({ user, token });
});

const login = catchAsync(async (req, res) => {
    const user = await authService.login(req.body);
    const token = tokenService.generateToken(user._id);
    res.status(status.OK).json({ user, token });
});

module.exports = { register, login };
