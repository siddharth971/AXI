/**
 * Auto-generated Plugin for Flavor365
 */
const responseHandler = require("../handlers/responses/auto_flavor365");

module.exports = {
  name: "auto_flavor365",
  description: "Autonomous handler for Flavor365",
  intents: {
    "knowledge.dynamic.flavor365": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
