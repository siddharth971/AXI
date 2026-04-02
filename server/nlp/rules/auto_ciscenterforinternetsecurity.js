/**
 * Auto-generated Rule for CIS Center for Internet Security
 */
module.exports = function(text, nlu) {
  if (/\b(ciscenterforinternetsecurity|CIS)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.ciscenterforinternetsecurity",
      confidence: 1.0,
      entities: { topic: "CIS Center for Internet Security" }
    };
  }
  return null;
};
