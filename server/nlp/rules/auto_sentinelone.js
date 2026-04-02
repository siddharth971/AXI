/**
 * Auto-generated Rule for SentinelOne
 */
module.exports = function(text, nlu) {
  if (/\b(sentinelone|SentinelOne)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.sentinelone",
      confidence: 1.0,
      entities: { topic: "SentinelOne" }
    };
  }
  return null;
};
