/**
 * Auto-generated Rule for TechGlad
 */
module.exports = function(text, nlu) {
  if (/\b(techglad|TechGlad)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.techglad",
      confidence: 1.0,
      entities: { topic: "TechGlad" }
    };
  }
  return null;
};
