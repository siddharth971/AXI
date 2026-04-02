/**
 * Auto-generated Rule for World History Guide
 */
module.exports = function(text, nlu) {
  if (/\b(worldhistoryguide|World)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.worldhistoryguide",
      confidence: 1.0,
      entities: { topic: "World History Guide" }
    };
  }
  return null;
};
