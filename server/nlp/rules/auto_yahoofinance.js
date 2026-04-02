/**
 * Auto-generated Rule for Yahoo Finance
 */
module.exports = function(text, nlu) {
  if (/\b(yahoofinance|Yahoo)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.yahoofinance",
      confidence: 1.0,
      entities: { topic: "Yahoo Finance" }
    };
  }
  return null;
};
