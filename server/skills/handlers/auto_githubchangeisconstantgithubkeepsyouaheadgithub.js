/**
 * Auto-generated Legacy Handler for GitHub · Change is constant. GitHub keeps you ahead. · GitHub
 */
const responses = require("./responses/auto_githubchangeisconstantgithubkeepsyouaheadgithub");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
