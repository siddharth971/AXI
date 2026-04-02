/**
 * Auto-generated Plugin for ScienceDaily: Your source for the latest research news
 */
const responseHandler = require("../handlers/responses/auto_sciencedailyyoursourceforthelatestresearchnews");

module.exports = {
  name: "auto_sciencedailyyoursourceforthelatestresearchnews",
  description: "Autonomous handler for ScienceDaily: Your source for the latest research news",
  intents: {
    "knowledge.dynamic.sciencedailyyoursourceforthelatestresearchnews": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
