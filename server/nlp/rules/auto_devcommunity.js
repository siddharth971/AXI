/**
 * Auto-generated Rule for DEV Community
 */
module.exports = function(text, nlu) {
  if (/\b(devcommunity|DEV)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.devcommunity",
      confidence: 1.0,
      entities: { topic: "DEV Community" }
    };
  }
  return null;
};
