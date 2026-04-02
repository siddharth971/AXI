/**
 * Auto-generated Rule for All About Circuits
 */
module.exports = function(text, nlu) {
  if (/\b(allaboutcircuits|All)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.allaboutcircuits",
      confidence: 1.0,
      entities: { topic: "All About Circuits" }
    };
  }
  return null;
};
