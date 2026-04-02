/**
 * Auto-generated Plugin for phoenixNAP: Data Center, Dedicated Servers, Cloud, &amp; Colocation
 */
const responseHandler = require("../handlers/responses/auto_phoenixnapdatacenterdedicatedserverscloudampcolocation");

module.exports = {
  name: "auto_phoenixnapdatacenterdedicatedserverscloudampcolocation",
  description: "Autonomous handler for phoenixNAP: Data Center, Dedicated Servers, Cloud, &amp; Colocation",
  intents: {
    "knowledge.dynamic.phoenixnapdatacenterdedicatedserverscloudampcolocation": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
