/**
 * Auto-generated Plugin for ResearchGate
 */
const responseHandler = require("../handlers/responses/auto_researchgate");

module.exports = {
  name: "auto_researchgate",
  description: "Autonomous handler for ResearchGate",
  intents: {
    "knowledge.dynamic.researchgate": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
