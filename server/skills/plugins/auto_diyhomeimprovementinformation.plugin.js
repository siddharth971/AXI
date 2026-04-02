/**
 * Auto-generated Plugin for DIY Home Improvement Information
 */
const responseHandler = require("../handlers/responses/auto_diyhomeimprovementinformation");

module.exports = {
  name: "auto_diyhomeimprovementinformation",
  description: "Autonomous handler for DIY Home Improvement Information",
  intents: {
    "knowledge.dynamic.diyhomeimprovementinformation": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
