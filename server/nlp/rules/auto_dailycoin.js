/**
 * Auto-generated Rule for DailyCoin
 */
module.exports = function(text, nlu) {
  if (/\b(dailycoin|DailyCoin)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.dailycoin",
      confidence: 1.0,
      entities: { topic: "DailyCoin" }
    };
  }
  return null;
};
