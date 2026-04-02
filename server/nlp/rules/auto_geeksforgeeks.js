/**
 * Auto-generated Rule for GeeksforGeeks
 */
module.exports = function(text, nlu) {
  if (/\b(geeksforgeeks|GeeksforGeeks)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.geeksforgeeks",
      confidence: 1.0,
      entities: { topic: "GeeksforGeeks" }
    };
  }
  return null;
};
