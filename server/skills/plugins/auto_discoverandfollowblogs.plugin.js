/**
 * Auto-generated Plugin for Discover and Follow Blogs
 */
const responseHandler = require("../handlers/responses/auto_discoverandfollowblogs");

module.exports = {
  name: "auto_discoverandfollowblogs",
  description: "Autonomous handler for Discover and Follow Blogs",
  intents: {
    "knowledge.dynamic.discoverandfollowblogs": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
