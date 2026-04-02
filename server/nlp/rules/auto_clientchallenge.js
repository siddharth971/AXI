/**
 * Auto-generated Rule for Client Challenge
 */
module.exports = function(text, nlu) {
  if (/\b(clientchallenge|Client)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.clientchallenge",
      confidence: 1.0,
      entities: { topic: "Client Challenge" }
    };
  }
  return null;
};
