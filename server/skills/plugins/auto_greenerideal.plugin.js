/**
 * Auto-generated Plugin for Greener Ideal
 */
const responseHandler = require("../handlers/responses/auto_greenerideal");

module.exports = {
  name: "auto_greenerideal",
  description: "Autonomous handler for Greener Ideal",
  intents: {
    "knowledge.dynamic.greenerideal": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
