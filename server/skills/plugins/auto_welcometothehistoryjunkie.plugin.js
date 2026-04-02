/**
 * Auto-generated Plugin for Welcome to The History Junkie
 */
const responseHandler = require("../handlers/responses/auto_welcometothehistoryjunkie");

module.exports = {
  name: "auto_welcometothehistoryjunkie",
  description: "Autonomous handler for Welcome to The History Junkie",
  intents: {
    "knowledge.dynamic.welcometothehistoryjunkie": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
