/**
 * Auto-generated Plugin for Telecom Trainer
 */
const responseHandler = require("../handlers/responses/auto_telecomtrainer");

module.exports = {
  name: "auto_telecomtrainer",
  description: "Autonomous handler for Telecom Trainer",
  intents: {
    "knowledge.dynamic.telecomtrainer": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
