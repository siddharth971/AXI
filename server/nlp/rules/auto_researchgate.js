/**
 * Auto-generated Rule for ResearchGate
 */
module.exports = function(text, nlu) {
  if (/\b(researchgate|ResearchGate)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.researchgate",
      confidence: 1.0,
      entities: { topic: "ResearchGate" }
    };
  }
  return null;
};
