/**
 * Auto-generated Plugin for The Official Microsoft Blog
 */
const responseHandler = require("../handlers/responses/auto_theofficialmicrosoftblog");

module.exports = {
  name: "auto_theofficialmicrosoftblog",
  description: "Autonomous handler for The Official Microsoft Blog",
  intents: {
    "knowledge.dynamic.theofficialmicrosoftblog": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
