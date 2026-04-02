/**
 * Auto-generated Plugin for Sustainable Jungle: Mission
 */
const responseHandler = require("../handlers/responses/auto_sustainablejunglemission");

module.exports = {
  name: "auto_sustainablejunglemission",
  description: "Autonomous handler for Sustainable Jungle: Mission",
  intents: {
    "knowledge.dynamic.sustainablejunglemission": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
