/**
 * Auto-generated Legacy Handler for Arlington, Ma Roofing Company: Residential &amp; Commercial
 */
const responses = require("./responses/auto_arlingtonmaroofingcompanyresidentialampcommercial");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
