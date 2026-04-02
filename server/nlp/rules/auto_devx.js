/**
 * Auto-generated Rule for DevX
 */
module.exports = function(text, nlu) {
  if (/\b(devx|DevX)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.devx",
      confidence: 1.0,
      entities: { topic: "DevX" }
    };
  }
  return null;
};
