/**
 * Auto-generated Rule for IJDACR
 */
module.exports = function(text, nlu) {
  if (/\b(ijdacr|IJDACR)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.ijdacr",
      confidence: 1.0,
      entities: { topic: "IJDACR" }
    };
  }
  return null;
};
