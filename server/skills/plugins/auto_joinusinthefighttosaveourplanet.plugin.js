/**
 * Auto-generated Plugin for Join Us in the Fight to Save our Planet
 */
const responseHandler = require("../handlers/responses/auto_joinusinthefighttosaveourplanet");

module.exports = {
  name: "auto_joinusinthefighttosaveourplanet",
  description: "Autonomous handler for Join Us in the Fight to Save our Planet",
  intents: {
    "knowledge.dynamic.joinusinthefighttosaveourplanet": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
