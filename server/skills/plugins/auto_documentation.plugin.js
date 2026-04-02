/**
 * Auto-generated Plugin for documentation
 */
const responseHandler = require("../handlers/responses/auto_documentation");

module.exports = {
  name: "auto_documentation",
  description: "Autonomous handler for documentation",
  intents: {
    "knowledge.dynamic.documentation": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
