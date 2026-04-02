/**
 * Auto-generated Rule for The Good Trade
 */
module.exports = function(text, nlu) {
  if (/\b(thegoodtrade|The)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.thegoodtrade",
      confidence: 1.0,
      entities: { topic: "The Good Trade" }
    };
  }
  return null;
};
