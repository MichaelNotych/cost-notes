const { exchangeRateApiKey } = require("../config/config");
const { Rate } = require("../models");

const requestRates = async () => {
    const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/latest/USD`
    );
    const data = await response.json();

    const rate = await Rate.create({
        rates: data.conversion_rates,
    });

    return rate;
};

const getLatestRates = async () => {
    const rate = await Rate.findOne().sort({ createdAt: -1 });
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    if (!rate || rate.createdAt < threeDaysAgo) {
        return requestRates();
    }
    return rate;
};

const convertAmount = async (amount, from, to = "USD") => {
    const rate = await getLatestRates();
    const fromRate = rate.rates.get(from);
    const toRate = rate.rates.get(to);
    return amount / fromRate * toRate;
};

module.exports = {
    convertAmount,
};
