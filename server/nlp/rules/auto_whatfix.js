/**
 * Auto-generated Rule for Whatfix
 */
module.exports = function(text, nlu) {
  if (/\b(whatfix|Whatfix)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.whatfix",
      confidence: 1.0,
      entities: { topic: "Whatfix" }
    };
  }
  return null;
};
