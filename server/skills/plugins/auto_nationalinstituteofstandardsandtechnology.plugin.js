/**
 * Auto-generated Plugin for National Institute of Standards and Technology
 */
const responseHandler = require("../handlers/responses/auto_nationalinstituteofstandardsandtechnology");

module.exports = {
  name: "auto_nationalinstituteofstandardsandtechnology",
  description: "Autonomous handler for National Institute of Standards and Technology",
  intents: {
    "knowledge.dynamic.nationalinstituteofstandardsandtechnology": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
