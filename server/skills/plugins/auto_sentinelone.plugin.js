/**
 * Auto-generated Plugin for SentinelOne
 */
const responseHandler = require("../handlers/responses/auto_sentinelone");

module.exports = {
  name: "auto_sentinelone",
  description: "Autonomous handler for SentinelOne",
  intents: {
    "knowledge.dynamic.sentinelone": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
