/**
 * Auto-generated Rule for The Family Handyman
 */
module.exports = function(text, nlu) {
  if (/\b(thefamilyhandyman|The)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.thefamilyhandyman",
      confidence: 1.0,
      entities: { topic: "The Family Handyman" }
    };
  }
  return null;
};
