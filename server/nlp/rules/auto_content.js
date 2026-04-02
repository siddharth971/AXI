/**
 * Auto-generated Rule for Content
 */
module.exports = function(text, nlu) {
  if (/\b(content|Content)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.content",
      confidence: 1.0,
      entities: { topic: "Content" }
    };
  }
  return null;
};
