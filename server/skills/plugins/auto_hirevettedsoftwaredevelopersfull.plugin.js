/**
 * Auto-generated Plugin for Hire Vetted Software Developers [Full
 */
const responseHandler = require("../handlers/responses/auto_hirevettedsoftwaredevelopersfull");

module.exports = {
  name: "auto_hirevettedsoftwaredevelopersfull",
  description: "Autonomous handler for Hire Vetted Software Developers [Full",
  intents: {
    "knowledge.dynamic.hirevettedsoftwaredevelopersfull": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
