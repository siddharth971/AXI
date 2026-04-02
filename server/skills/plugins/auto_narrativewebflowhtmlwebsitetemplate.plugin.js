/**
 * Auto-generated Plugin for Narrative · Webflow HTML website template
 */
const responseHandler = require("../handlers/responses/auto_narrativewebflowhtmlwebsitetemplate");

module.exports = {
  name: "auto_narrativewebflowhtmlwebsitetemplate",
  description: "Autonomous handler for Narrative · Webflow HTML website template",
  intents: {
    "knowledge.dynamic.narrativewebflowhtmlwebsitetemplate": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
