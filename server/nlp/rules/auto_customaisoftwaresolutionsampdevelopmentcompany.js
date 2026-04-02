/**
 * Auto-generated Rule for Custom AI Software Solutions &amp; Development Company
 */
module.exports = function(text, nlu) {
  if (/\b(customaisoftwaresolutionsampdevelopmentcompany|Custom)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.customaisoftwaresolutionsampdevelopmentcompany",
      confidence: 1.0,
      entities: { topic: "Custom AI Software Solutions &amp; Development Company" }
    };
  }
  return null;
};
