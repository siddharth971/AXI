/**
 * Auto-generated Rule for DIY Home Improvement Information
 */
module.exports = function(text, nlu) {
  if (/\b(diyhomeimprovementinformation|DIY)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.diyhomeimprovementinformation",
      confidence: 1.0,
      entities: { topic: "DIY Home Improvement Information" }
    };
  }
  return null;
};
