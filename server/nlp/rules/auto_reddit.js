/**
 * Auto-generated Rule for Reddit
 */
module.exports = function(text, nlu) {
  if (/\b(reddit|Reddit)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.reddit",
      confidence: 1.0,
      entities: { topic: "Reddit" }
    };
  }
  return null;
};
