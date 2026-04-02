/**
 * Auto-generated Plugin for National University I Earn Your Degree Online
 */
const responseHandler = require("../handlers/responses/auto_nationaluniversityiearnyourdegreeonline");

module.exports = {
  name: "auto_nationaluniversityiearnyourdegreeonline",
  description: "Autonomous handler for National University I Earn Your Degree Online",
  intents: {
    "knowledge.dynamic.nationaluniversityiearnyourdegreeonline": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
