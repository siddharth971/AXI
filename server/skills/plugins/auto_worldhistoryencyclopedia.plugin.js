/**
 * Auto-generated Plugin for World History Encyclopedia
 */
const responseHandler = require("../handlers/responses/auto_worldhistoryencyclopedia");

module.exports = {
  name: "auto_worldhistoryencyclopedia",
  description: "Autonomous handler for World History Encyclopedia",
  intents: {
    "knowledge.dynamic.worldhistoryencyclopedia": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
