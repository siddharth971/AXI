/**
 * Auto-generated Rule for react.dev
 */
module.exports = function(text, nlu) {
  if (/\b(reactdev|reactdev)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.reactdev",
      confidence: 1.0,
      entities: { topic: "react.dev" }
    };
  }
  return null;
};
