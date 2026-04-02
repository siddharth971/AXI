/**
 * Auto-generated Plugin for CIS Center for Internet Security
 */
const responseHandler = require("../handlers/responses/auto_ciscenterforinternetsecurity");

module.exports = {
  name: "auto_ciscenterforinternetsecurity",
  description: "Autonomous handler for CIS Center for Internet Security",
  intents: {
    "knowledge.dynamic.ciscenterforinternetsecurity": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
