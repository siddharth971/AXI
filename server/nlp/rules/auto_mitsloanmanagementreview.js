/**
 * Auto-generated Rule for MIT Sloan Management Review
 */
module.exports = function(text, nlu) {
  if (/\b(mitsloanmanagementreview|MIT)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.mitsloanmanagementreview",
      confidence: 1.0,
      entities: { topic: "MIT Sloan Management Review" }
    };
  }
  return null;
};
