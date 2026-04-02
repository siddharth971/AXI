/**
 * Auto-generated Plugin for Wikipedia, the free encyclopedia
 */
const responseHandler = require("../handlers/responses/auto_wikipediathefreeencyclopedia");

module.exports = {
  name: "auto_wikipediathefreeencyclopedia",
  description: "Autonomous handler for Wikipedia, the free encyclopedia",
  intents: {
    "knowledge.dynamic.wikipediathefreeencyclopedia": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
