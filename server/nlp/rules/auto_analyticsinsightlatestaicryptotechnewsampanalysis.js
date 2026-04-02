/**
 * Auto-generated Rule for Analytics Insight: Latest AI, Crypto, Tech News &amp; Analysis
 */
module.exports = function(text, nlu) {
  if (/\b(analyticsinsightlatestaicryptotechnewsampanalysis|Analytics)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.analyticsinsightlatestaicryptotechnewsampanalysis",
      confidence: 1.0,
      entities: { topic: "Analytics Insight: Latest AI, Crypto, Tech News &amp; Analysis" }
    };
  }
  return null;
};
