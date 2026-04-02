/**
 * Auto-generated Rule for YouTube
 */
module.exports = function(text, nlu) {
  if (/\b(youtube|YouTube)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.youtube",
      confidence: 1.0,
      entities: { topic: "YouTube" }
    };
  }
  return null;
};
