/**
 * Auto-generated Plugin for Tech Startups
 */
const responseHandler = require("../handlers/responses/auto_techstartups");

module.exports = {
  name: "auto_techstartups",
  description: "Autonomous handler for Tech Startups",
  intents: {
    "knowledge.dynamic.techstartups": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
