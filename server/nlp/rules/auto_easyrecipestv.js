/**
 * Auto-generated Rule for Easy Recipes TV
 */
module.exports = function(text, nlu) {
  if (/\b(easyrecipestv|Easy)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.easyrecipestv",
      confidence: 1.0,
      entities: { topic: "Easy Recipes TV" }
    };
  }
  return null;
};
