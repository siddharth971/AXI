/**
 * Auto-generated Rule for Find the best blogs on the web
 */
module.exports = function(text, nlu) {
  if (/\b(findthebestblogsontheweb|Find)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.findthebestblogsontheweb",
      confidence: 1.0,
      entities: { topic: "Find the best blogs on the web" }
    };
  }
  return null;
};
