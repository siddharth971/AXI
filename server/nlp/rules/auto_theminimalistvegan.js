/**
 * Auto-generated Rule for The Minimalist Vegan
 */
module.exports = function(text, nlu) {
  if (/\b(theminimalistvegan|The)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.theminimalistvegan",
      confidence: 1.0,
      entities: { topic: "The Minimalist Vegan" }
    };
  }
  return null;
};
