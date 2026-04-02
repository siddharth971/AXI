/**
 * Auto-generated Plugin for IJDACR
 */
const responseHandler = require("../handlers/responses/auto_ijdacr");

module.exports = {
  name: "auto_ijdacr",
  description: "Autonomous handler for IJDACR",
  intents: {
    "knowledge.dynamic.ijdacr": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
