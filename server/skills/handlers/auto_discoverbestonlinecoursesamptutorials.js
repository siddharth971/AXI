/**
 * Auto-generated Legacy Handler for Discover Best Online Courses &amp; Tutorials
 */
const responses = require("./responses/auto_discoverbestonlinecoursesamptutorials");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
