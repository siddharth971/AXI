/**
 * Auto-generated Rule for MIT Open Learning brings Online Learning to MIT and the world
 */
module.exports = function(text, nlu) {
  if (/\b(mitopenlearningbringsonlinelearningtomitandtheworld|MIT)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.mitopenlearningbringsonlinelearningtomitandtheworld",
      confidence: 1.0,
      entities: { topic: "MIT Open Learning brings Online Learning to MIT and the world" }
    };
  }
  return null;
};
