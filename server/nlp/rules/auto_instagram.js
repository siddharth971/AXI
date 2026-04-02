/**
 * Auto-generated Rule for Instagram
 */
module.exports = function(text, nlu) {
  if (/\b(instagram|Instagram)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.instagram",
      confidence: 1.0,
      entities: { topic: "Instagram" }
    };
  }
  return null;
};
