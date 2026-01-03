require("dotenv").config();
const { envValidation } = require("./../validations");
const { value: envVars, error } = envValidation.validate(process.env);

if (error) {
	console.log(error);
}

module.exports = {
	port: envVars.PORT,
	dbConnection: envVars.DB_CONNECTION,
	env: envVars.NODE_ENV,
	jwtSecret: envVars.JWT_SECRET,
	googleApiKey: envVars.GOOGLE_API_KEY,
	exchangeRateApiKey: envVars.EXCHANGE_RATE_API_KEY,
};
