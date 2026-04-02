/**
 * Auto-generated Rule for Welcome to The History Junkie
 */
module.exports = function(text, nlu) {
  if (/\b(welcometothehistoryjunkie|Welcome)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.welcometothehistoryjunkie",
      confidence: 1.0,
      entities: { topic: "Welcome to The History Junkie" }
    };
  }
  return null;
};
