/**
 * Auto-generated Plugin for MENU TIGER
 */
const responseHandler = require("../handlers/responses/auto_menutiger");

module.exports = {
  name: "auto_menutiger",
  description: "Autonomous handler for MENU TIGER",
  intents: {
    "knowledge.dynamic.menutiger": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
