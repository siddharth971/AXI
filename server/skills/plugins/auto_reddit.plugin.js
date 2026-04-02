/**
 * Auto-generated Plugin for Reddit
 */
const responseHandler = require("../handlers/responses/auto_reddit");

module.exports = {
  name: "auto_reddit",
  description: "Autonomous handler for Reddit",
  intents: {
    "knowledge.dynamic.reddit": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
