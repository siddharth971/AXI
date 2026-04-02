/**
 * Auto-generated Plugin for World History Matters » A Portal to World History Sites from the Center for History and New Media
 */
const responseHandler = require("../handlers/responses/auto_worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia");

module.exports = {
  name: "auto_worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia",
  description: "Autonomous handler for World History Matters » A Portal to World History Sites from the Center for History and New Media",
  intents: {
    "knowledge.dynamic.worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
