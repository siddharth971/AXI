/**
 * Auto-generated Plugin for GeeksforGeeks
 */
const responseHandler = require("../handlers/responses/auto_geeksforgeeks");

module.exports = {
  name: "auto_geeksforgeeks",
  description: "Autonomous handler for GeeksforGeeks",
  intents: {
    "knowledge.dynamic.geeksforgeeks": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
