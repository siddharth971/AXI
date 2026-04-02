/**
 * Auto-generated Rule for Flavor365
 */
module.exports = function(text, nlu) {
  if (/\b(flavor365|Flavor365)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.flavor365",
      confidence: 1.0,
      entities: { topic: "Flavor365" }
    };
  }
  return null;
};
