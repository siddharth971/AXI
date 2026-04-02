/**
 * Auto-generated Legacy Handler for Home Design, Decorating and Remodeling Ideas, Landscaping, Kitchen and Bathroom Design
 */
const responses = require("./responses/auto_homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
