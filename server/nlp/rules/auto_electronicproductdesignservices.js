/**
 * Auto-generated Rule for Electronic Product Design Services
 */
module.exports = function(text, nlu) {
  if (/\b(electronicproductdesignservices|Electronic)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.electronicproductdesignservices",
      confidence: 1.0,
      entities: { topic: "Electronic Product Design Services" }
    };
  }
  return null;
};
