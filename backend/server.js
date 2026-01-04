const express = require("express");
const { status } = require("http-status");

const ApiError = require("./utils/ApiError");
const { errorHandler, errorConverter } = require("./middlewares/error");
const authRouter = require("./routes/auth.route");
const expenseRouter = require("./routes/expense.route");
const categoryRouter = require("./routes/category.route");
const cors = require("cors");
const config = require("./config/config");
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    console.log(`[DEBUG] Request received: ${req.method} ${req.url}`);
    next();
});
app.use(
	cors({
		origin: config.clientUrl,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);
app.use(authRouter);
app.use(expenseRouter);
app.use(categoryRouter);
app.use((req, res, next) => {
    next(new ApiError(status.NOT_FOUND, "Not found"));
});
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
