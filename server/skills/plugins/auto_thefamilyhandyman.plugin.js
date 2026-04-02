/**
 * Auto-generated Plugin for The Family Handyman
 */
const responseHandler = require("../handlers/responses/auto_thefamilyhandyman");

module.exports = {
  name: "auto_thefamilyhandyman",
  description: "Autonomous handler for The Family Handyman",
  intents: {
    "knowledge.dynamic.thefamilyhandyman": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
