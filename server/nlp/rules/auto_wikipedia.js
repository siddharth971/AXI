/**
 * Auto-generated Rule for Wikipedia
 */
module.exports = function(text, nlu) {
  if (/\b(wikipedia|Wikipedia)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.wikipedia",
      confidence: 1.0,
      entities: { topic: "Wikipedia" }
    };
  }
  return null;
};
