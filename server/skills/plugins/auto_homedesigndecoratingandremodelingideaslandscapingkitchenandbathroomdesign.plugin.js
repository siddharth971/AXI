/**
 * Auto-generated Plugin for Home Design, Decorating and Remodeling Ideas, Landscaping, Kitchen and Bathroom Design
 */
const responseHandler = require("../handlers/responses/auto_homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign");

module.exports = {
  name: "auto_homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign",
  description: "Autonomous handler for Home Design, Decorating and Remodeling Ideas, Landscaping, Kitchen and Bathroom Design",
  intents: {
    "knowledge.dynamic.homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
