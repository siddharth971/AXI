/**
 * Auto-generated Plugin for The Timemaps Atlas of World History
 */
const responseHandler = require("../handlers/responses/auto_thetimemapsatlasofworldhistory");

module.exports = {
  name: "auto_thetimemapsatlasofworldhistory",
  description: "Autonomous handler for The Timemaps Atlas of World History",
  intents: {
    "knowledge.dynamic.thetimemapsatlasofworldhistory": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
