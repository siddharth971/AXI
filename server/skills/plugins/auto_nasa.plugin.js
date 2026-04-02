/**
 * Auto-generated Plugin for NASA
 */
const responseHandler = require("../handlers/responses/auto_nasa");

module.exports = {
  name: "auto_nasa",
  description: "Autonomous handler for NASA",
  intents: {
    "knowledge.dynamic.nasa": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
