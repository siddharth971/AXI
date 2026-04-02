/**
 * Auto-generated Rule for Computer and Electronics Recycling Services
 */
module.exports = function(text, nlu) {
  if (/\b(computerandelectronicsrecyclingservices|Computer)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.computerandelectronicsrecyclingservices",
      confidence: 1.0,
      entities: { topic: "Computer and Electronics Recycling Services" }
    };
  }
  return null;
};
