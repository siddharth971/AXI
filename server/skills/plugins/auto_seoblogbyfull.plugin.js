/**
 * Auto-generated Plugin for SEO blog by full
 */
const responseHandler = require("../handlers/responses/auto_seoblogbyfull");

module.exports = {
  name: "auto_seoblogbyfull",
  description: "Autonomous handler for SEO blog by full",
  intents: {
    "knowledge.dynamic.seoblogbyfull": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
