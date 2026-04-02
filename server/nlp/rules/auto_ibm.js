/**
 * Auto-generated Rule for IBM
 */
module.exports = function(text, nlu) {
  if (/\b(ibm|IBM)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.ibm",
      confidence: 1.0,
      entities: { topic: "IBM" }
    };
  }
  return null;
};
