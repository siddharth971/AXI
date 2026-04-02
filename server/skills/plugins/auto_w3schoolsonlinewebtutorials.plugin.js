/**
 * Auto-generated Plugin for W3Schools Online Web Tutorials
 */
const responseHandler = require("../handlers/responses/auto_w3schoolsonlinewebtutorials");

module.exports = {
  name: "auto_w3schoolsonlinewebtutorials",
  description: "Autonomous handler for W3Schools Online Web Tutorials",
  intents: {
    "knowledge.dynamic.w3schoolsonlinewebtutorials": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
