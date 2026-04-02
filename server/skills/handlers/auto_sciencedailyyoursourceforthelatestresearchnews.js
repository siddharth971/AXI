/**
 * Auto-generated Legacy Handler for ScienceDaily: Your source for the latest research news
 */
const responses = require("./responses/auto_sciencedailyyoursourceforthelatestresearchnews");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
