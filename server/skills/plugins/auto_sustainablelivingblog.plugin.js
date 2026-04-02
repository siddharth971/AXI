/**
 * Auto-generated Plugin for Sustainable Living Blog
 */
const responseHandler = require("../handlers/responses/auto_sustainablelivingblog");

module.exports = {
  name: "auto_sustainablelivingblog",
  description: "Autonomous handler for Sustainable Living Blog",
  intents: {
    "knowledge.dynamic.sustainablelivingblog": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
