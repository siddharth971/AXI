/**
 * Auto-generated Plugin for Encyclopedia Britannica
 */
const responseHandler = require("../handlers/responses/auto_encyclopediabritannica");

module.exports = {
  name: "auto_encyclopediabritannica",
  description: "Autonomous handler for Encyclopedia Britannica",
  intents: {
    "knowledge.dynamic.encyclopediabritannica": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
