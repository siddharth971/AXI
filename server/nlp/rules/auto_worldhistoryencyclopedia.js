/**
 * Auto-generated Rule for World History Encyclopedia
 */
module.exports = function(text, nlu) {
  if (/\b(worldhistoryencyclopedia|World)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.worldhistoryencyclopedia",
      confidence: 1.0,
      entities: { topic: "World History Encyclopedia" }
    };
  }
  return null;
};
