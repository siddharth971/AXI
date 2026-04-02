/**
 * Auto-generated Plugin for Visible
 */
const responseHandler = require("../handlers/responses/auto_visible");

module.exports = {
  name: "auto_visible",
  description: "Autonomous handler for Visible",
  intents: {
    "knowledge.dynamic.visible": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
