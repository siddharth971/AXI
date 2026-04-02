/**
 * Auto-generated Plugin for Welcome to nginx!
 */
const responseHandler = require("../handlers/responses/auto_welcometonginx");

module.exports = {
  name: "auto_welcometonginx",
  description: "Autonomous handler for Welcome to nginx!",
  intents: {
    "knowledge.dynamic.welcometonginx": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
