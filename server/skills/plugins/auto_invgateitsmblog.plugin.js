/**
 * Auto-generated Plugin for InvGate ITSM blog
 */
const responseHandler = require("../handlers/responses/auto_invgateitsmblog");

module.exports = {
  name: "auto_invgateitsmblog",
  description: "Autonomous handler for InvGate ITSM blog",
  intents: {
    "knowledge.dynamic.invgateitsmblog": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
