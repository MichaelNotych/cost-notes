const parseExpensePrompt = (expense) => {
    return `
    Extract the following details from the expense description:
    - amount (number)
    - currency (ISO code, e.g., USD (US Dollar), THB (Thai Baht), LAK (Laos Kip))
    - title (short description)
    - category (one word category, e.g., Food, Transport, Entertainment)

    Input: "${expense}"

    Output JSON format:
    {
      "amount": number,
      "currency": "string",
      "title": "string",
      "category": "string"
    }
    
    Return ONLY valid JSON.;
    `;
};

module.exports = {
    parseExpensePrompt
};
