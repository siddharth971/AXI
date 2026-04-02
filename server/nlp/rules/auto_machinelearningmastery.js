/**
 * Auto-generated Rule for Machine Learning Mastery
 */
module.exports = function(text, nlu) {
  if (/\b(machinelearningmastery|Machine)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.machinelearningmastery",
      confidence: 1.0,
      entities: { topic: "Machine Learning Mastery" }
    };
  }
  return null;
};
