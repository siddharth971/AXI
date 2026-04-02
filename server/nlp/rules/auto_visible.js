/**
 * Auto-generated Rule for Visible
 */
module.exports = function(text, nlu) {
  if (/\b(visible|Visible)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.visible",
      confidence: 1.0,
      entities: { topic: "Visible" }
    };
  }
  return null;
};
