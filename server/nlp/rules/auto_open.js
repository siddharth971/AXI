/**
 * Auto-generated Rule for Open
 */
module.exports = function(text, nlu) {
  if (/\b(open|Open)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.open",
      confidence: 1.0,
      entities: { topic: "Open" }
    };
  }
  return null;
};
