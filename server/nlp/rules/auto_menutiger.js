/**
 * Auto-generated Rule for MENU TIGER
 */
module.exports = function(text, nlu) {
  if (/\b(menutiger|MENU)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.menutiger",
      confidence: 1.0,
      entities: { topic: "MENU TIGER" }
    };
  }
  return null;
};
