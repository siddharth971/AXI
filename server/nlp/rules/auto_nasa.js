/**
 * Auto-generated Rule for NASA
 */
module.exports = function(text, nlu) {
  if (/\b(nasa|NASA)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.nasa",
      confidence: 1.0,
      entities: { topic: "NASA" }
    };
  }
  return null;
};
