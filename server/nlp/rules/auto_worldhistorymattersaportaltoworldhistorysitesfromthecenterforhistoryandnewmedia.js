/**
 * Auto-generated Rule for World History Matters » A Portal to World History Sites from the Center for History and New Media
 */
module.exports = function(text, nlu) {
  if (/\b(worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia|World)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia",
      confidence: 1.0,
      entities: { topic: "World History Matters » A Portal to World History Sites from the Center for History and New Media" }
    };
  }
  return null;
};
