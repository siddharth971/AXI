/**
 * Auto-generated Plugin for Kitchen with Hoor Zahra
 */
const responseHandler = require("../handlers/responses/auto_kitchenwithhoorzahra");

module.exports = {
  name: "auto_kitchenwithhoorzahra",
  description: "Autonomous handler for Kitchen with Hoor Zahra",
  intents: {
    "knowledge.dynamic.kitchenwithhoorzahra": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
