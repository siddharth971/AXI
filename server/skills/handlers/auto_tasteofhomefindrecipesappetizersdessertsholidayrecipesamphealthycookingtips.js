/**
 * Auto-generated Legacy Handler for Taste of Home: Find Recipes, Appetizers, Desserts, Holiday Recipes &amp; Healthy Cooking Tips
 */
const responses = require("./responses/auto_tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
