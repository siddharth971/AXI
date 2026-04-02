/**
 * Auto-generated Rule for documentation
 */
module.exports = function(text, nlu) {
  if (/\b(documentation|documentation)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.documentation",
      confidence: 1.0,
      entities: { topic: "documentation" }
    };
  }
  return null;
};
