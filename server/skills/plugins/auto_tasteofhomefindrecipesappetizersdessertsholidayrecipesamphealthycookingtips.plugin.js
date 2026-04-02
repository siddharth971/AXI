/**
 * Auto-generated Plugin for Taste of Home: Find Recipes, Appetizers, Desserts, Holiday Recipes &amp; Healthy Cooking Tips
 */
const responseHandler = require("../handlers/responses/auto_tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips");

module.exports = {
  name: "auto_tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips",
  description: "Autonomous handler for Taste of Home: Find Recipes, Appetizers, Desserts, Holiday Recipes &amp; Healthy Cooking Tips",
  intents: {
    "knowledge.dynamic.tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
