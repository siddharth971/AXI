/**
 * Auto-generated Rule for Sustainable Living Blog
 */
module.exports = function(text, nlu) {
  if (/\b(sustainablelivingblog|Sustainable)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.sustainablelivingblog",
      confidence: 1.0,
      entities: { topic: "Sustainable Living Blog" }
    };
  }
  return null;
};
