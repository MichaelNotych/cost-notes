const userService = require("./user.service");
const { status } = require("http-status");
const ApiError = require("./../utils/ApiError");
const login = async ({ email, password }) => {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(
            status.UNAUTHORIZED,
            "Incorrect email or password"
        );
    }
    return user;
};

module.exports = {
    login,
};
