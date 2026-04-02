/**
 * Auto-generated Plugin for The Spruce: Make Your Best Home
 */
const responseHandler = require("../handlers/responses/auto_thesprucemakeyourbesthome");

module.exports = {
  name: "auto_thesprucemakeyourbesthome",
  description: "Autonomous handler for The Spruce: Make Your Best Home",
  intents: {
    "knowledge.dynamic.thesprucemakeyourbesthome": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
