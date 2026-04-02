/**
 * Auto-generated Plugin for Find the best blogs on the web
 */
const responseHandler = require("../handlers/responses/auto_findthebestblogsontheweb");

module.exports = {
  name: "auto_findthebestblogsontheweb",
  description: "Autonomous handler for Find the best blogs on the web",
  intents: {
    "knowledge.dynamic.findthebestblogsontheweb": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
