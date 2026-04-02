/**
 * Auto-generated Plugin for MIT Sloan Management Review
 */
const responseHandler = require("../handlers/responses/auto_mitsloanmanagementreview");

module.exports = {
  name: "auto_mitsloanmanagementreview",
  description: "Autonomous handler for MIT Sloan Management Review",
  intents: {
    "knowledge.dynamic.mitsloanmanagementreview": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
