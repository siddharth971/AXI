/**
 * Auto-generated Plugin for Open Source Endpoint Detection and Response (EDR)
 */
const responseHandler = require("../handlers/responses/auto_opensourceendpointdetectionandresponseedr");

module.exports = {
  name: "auto_opensourceendpointdetectionandresponseedr",
  description: "Autonomous handler for Open Source Endpoint Detection and Response (EDR)",
  intents: {
    "knowledge.dynamic.opensourceendpointdetectionandresponseedr": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
