/**
 * Auto-generated Plugin for Home Page
 */
const responseHandler = require("../handlers/responses/auto_homepage");

module.exports = {
  name: "auto_homepage",
  description: "Autonomous handler for Home Page",
  intents: {
    "knowledge.dynamic.homepage": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
