/**
 * Auto-generated Plugin for Content
 */
const responseHandler = require("../handlers/responses/auto_content");

module.exports = {
  name: "auto_content",
  description: "Autonomous handler for Content",
  intents: {
    "knowledge.dynamic.content": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
