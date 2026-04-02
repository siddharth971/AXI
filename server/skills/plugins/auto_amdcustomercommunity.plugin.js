/**
 * Auto-generated Plugin for AMD Customer Community
 */
const responseHandler = require("../handlers/responses/auto_amdcustomercommunity");

module.exports = {
  name: "auto_amdcustomercommunity",
  description: "Autonomous handler for AMD Customer Community",
  intents: {
    "knowledge.dynamic.amdcustomercommunity": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
