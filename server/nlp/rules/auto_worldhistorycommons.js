/**
 * Auto-generated Rule for World History Commons
 */
module.exports = function(text, nlu) {
  if (/\b(worldhistorycommons|World)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.worldhistorycommons",
      confidence: 1.0,
      entities: { topic: "World History Commons" }
    };
  }
  return null;
};
