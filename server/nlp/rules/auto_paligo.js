/**
 * Auto-generated Rule for Paligo
 */
module.exports = function(text, nlu) {
  if (/\b(paligo|Paligo)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.paligo",
      confidence: 1.0,
      entities: { topic: "Paligo" }
    };
  }
  return null;
};
