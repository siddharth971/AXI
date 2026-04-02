/**
 * Auto-generated Rule for Bob Vila
 */
module.exports = function(text, nlu) {
  if (/\b(bobvila|Bob)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.bobvila",
      confidence: 1.0,
      entities: { topic: "Bob Vila" }
    };
  }
  return null;
};
