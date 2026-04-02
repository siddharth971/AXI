/**
 * Auto-generated Plugin for LinkedIn: Log In or Sign Up
 */
const responseHandler = require("../handlers/responses/auto_linkedinloginorsignup");

module.exports = {
  name: "auto_linkedinloginorsignup",
  description: "Autonomous handler for LinkedIn: Log In or Sign Up",
  intents: {
    "knowledge.dynamic.linkedinloginorsignup": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
