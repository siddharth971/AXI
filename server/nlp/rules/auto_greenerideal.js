/**
 * Auto-generated Rule for Greener Ideal
 */
module.exports = function(text, nlu) {
  if (/\b(greenerideal|Greener)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.greenerideal",
      confidence: 1.0,
      entities: { topic: "Greener Ideal" }
    };
  }
  return null;
};
