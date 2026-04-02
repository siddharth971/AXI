/**
 * Auto-generated Plugin for Kinsta®
 */
const responseHandler = require("../handlers/responses/auto_kinsta");

module.exports = {
  name: "auto_kinsta",
  description: "Autonomous handler for Kinsta®",
  intents: {
    "knowledge.dynamic.kinsta": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
