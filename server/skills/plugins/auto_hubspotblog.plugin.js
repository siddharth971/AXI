/**
 * Auto-generated Plugin for HubSpot Blog
 */
const responseHandler = require("../handlers/responses/auto_hubspotblog");

module.exports = {
  name: "auto_hubspotblog",
  description: "Autonomous handler for HubSpot Blog",
  intents: {
    "knowledge.dynamic.hubspotblog": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
