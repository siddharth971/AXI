/**
 * Auto-generated Rule for High
 */
module.exports = function(text, nlu) {
  if (/\b(high|High)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.high",
      confidence: 1.0,
      entities: { topic: "High" }
    };
  }
  return null;
};
