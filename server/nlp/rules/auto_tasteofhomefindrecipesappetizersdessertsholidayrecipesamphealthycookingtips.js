/**
 * Auto-generated Rule for Taste of Home: Find Recipes, Appetizers, Desserts, Holiday Recipes &amp; Healthy Cooking Tips
 */
module.exports = function(text, nlu) {
  if (/\b(tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips|Taste)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips",
      confidence: 1.0,
      entities: { topic: "Taste of Home: Find Recipes, Appetizers, Desserts, Holiday Recipes &amp; Healthy Cooking Tips" }
    };
  }
  return null;
};
