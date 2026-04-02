/**
 * Auto-generated Plugin for TechTarget
 */
const responseHandler = require("../handlers/responses/auto_techtarget");

module.exports = {
  name: "auto_techtarget",
  description: "Autonomous handler for TechTarget",
  intents: {
    "knowledge.dynamic.techtarget": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
