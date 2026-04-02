/**
 * Auto-generated Plugin for Whatfix
 */
const responseHandler = require("../handlers/responses/auto_whatfix");

module.exports = {
  name: "auto_whatfix",
  description: "Autonomous handler for Whatfix",
  intents: {
    "knowledge.dynamic.whatfix": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
