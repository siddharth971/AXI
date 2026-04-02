/**
 * Auto-generated Legacy Handler for Analytics Insight: Latest AI, Crypto, Tech News &amp; Analysis
 */
const responses = require("./responses/auto_analyticsinsightlatestaicryptotechnewsampanalysis");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
