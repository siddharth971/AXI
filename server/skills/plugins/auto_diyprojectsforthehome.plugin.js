/**
 * Auto-generated Plugin for DIY Projects for the Home
 */
const responseHandler = require("../handlers/responses/auto_diyprojectsforthehome");

module.exports = {
  name: "auto_diyprojectsforthehome",
  description: "Autonomous handler for DIY Projects for the Home",
  intents: {
    "knowledge.dynamic.diyprojectsforthehome": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
