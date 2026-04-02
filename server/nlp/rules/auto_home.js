/**
 * Auto-generated Rule for Home
 */
module.exports = function(text, nlu) {
  if (/\b(home|Home)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.home",
      confidence: 1.0,
      entities: { topic: "Home" }
    };
  }
  return null;
};
