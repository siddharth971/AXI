/**
 * Auto-generated Plugin for OpenHistoricalMap
 */
const responseHandler = require("../handlers/responses/auto_openhistoricalmap");

module.exports = {
  name: "auto_openhistoricalmap",
  description: "Autonomous handler for OpenHistoricalMap",
  intents: {
    "knowledge.dynamic.openhistoricalmap": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
