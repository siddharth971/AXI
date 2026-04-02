/**
 * Auto-generated Plugin for Your Sustainable Guide
 */
const responseHandler = require("../handlers/responses/auto_yoursustainableguide");

module.exports = {
  name: "auto_yoursustainableguide",
  description: "Autonomous handler for Your Sustainable Guide",
  intents: {
    "knowledge.dynamic.yoursustainableguide": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
