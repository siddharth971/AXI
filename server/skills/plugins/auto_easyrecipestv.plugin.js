/**
 * Auto-generated Plugin for Easy Recipes TV
 */
const responseHandler = require("../handlers/responses/auto_easyrecipestv");

module.exports = {
  name: "auto_easyrecipestv",
  description: "Autonomous handler for Easy Recipes TV",
  intents: {
    "knowledge.dynamic.easyrecipestv": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
