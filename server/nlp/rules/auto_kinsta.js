/**
 * Auto-generated Rule for Kinsta®
 */
module.exports = function(text, nlu) {
  if (/\b(kinsta|Kinsta)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.kinsta",
      confidence: 1.0,
      entities: { topic: "Kinsta®" }
    };
  }
  return null;
};
