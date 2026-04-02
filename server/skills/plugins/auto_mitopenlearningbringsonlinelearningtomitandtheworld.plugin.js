/**
 * Auto-generated Plugin for MIT Open Learning brings Online Learning to MIT and the world
 */
const responseHandler = require("../handlers/responses/auto_mitopenlearningbringsonlinelearningtomitandtheworld");

module.exports = {
  name: "auto_mitopenlearningbringsonlinelearningtomitandtheworld",
  description: "Autonomous handler for MIT Open Learning brings Online Learning to MIT and the world",
  intents: {
    "knowledge.dynamic.mitopenlearningbringsonlinelearningtomitandtheworld": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
