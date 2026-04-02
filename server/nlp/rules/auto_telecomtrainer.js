/**
 * Auto-generated Rule for Telecom Trainer
 */
module.exports = function(text, nlu) {
  if (/\b(telecomtrainer|Telecom)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.telecomtrainer",
      confidence: 1.0,
      entities: { topic: "Telecom Trainer" }
    };
  }
  return null;
};
