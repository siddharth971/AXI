/**
 * Auto-generated Plugin for All About Circuits
 */
const responseHandler = require("../handlers/responses/auto_allaboutcircuits");

module.exports = {
  name: "auto_allaboutcircuits",
  description: "Autonomous handler for All About Circuits",
  intents: {
    "knowledge.dynamic.allaboutcircuits": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
