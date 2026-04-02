/**
 * Auto-generated Plugin for The Minimalist Vegan
 */
const responseHandler = require("../handlers/responses/auto_theminimalistvegan");

module.exports = {
  name: "auto_theminimalistvegan",
  description: "Autonomous handler for The Minimalist Vegan",
  intents: {
    "knowledge.dynamic.theminimalistvegan": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
