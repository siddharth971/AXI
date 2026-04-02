/**
 * Auto-generated Rule for Live Science
 */
module.exports = function(text, nlu) {
  if (/\b(livescience|Live)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.livescience",
      confidence: 1.0,
      entities: { topic: "Live Science" }
    };
  }
  return null;
};
