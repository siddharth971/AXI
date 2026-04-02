/**
 * Auto-generated Plugin for Discover Best Online Courses &amp; Tutorials
 */
const responseHandler = require("../handlers/responses/auto_discoverbestonlinecoursesamptutorials");

module.exports = {
  name: "auto_discoverbestonlinecoursesamptutorials",
  description: "Autonomous handler for Discover Best Online Courses &amp; Tutorials",
  intents: {
    "knowledge.dynamic.discoverbestonlinecoursesamptutorials": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
