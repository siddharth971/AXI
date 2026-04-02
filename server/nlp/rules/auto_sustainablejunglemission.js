/**
 * Auto-generated Rule for Sustainable Jungle: Mission
 */
module.exports = function(text, nlu) {
  if (/\b(sustainablejunglemission|Sustainable)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.sustainablejunglemission",
      confidence: 1.0,
      entities: { topic: "Sustainable Jungle: Mission" }
    };
  }
  return null;
};
