/**
 * Auto-generated Plugin for Arlington, Ma Roofing Company: Residential &amp; Commercial
 */
const responseHandler = require("../handlers/responses/auto_arlingtonmaroofingcompanyresidentialampcommercial");

module.exports = {
  name: "auto_arlingtonmaroofingcompanyresidentialampcommercial",
  description: "Autonomous handler for Arlington, Ma Roofing Company: Residential &amp; Commercial",
  intents: {
    "knowledge.dynamic.arlingtonmaroofingcompanyresidentialampcommercial": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
