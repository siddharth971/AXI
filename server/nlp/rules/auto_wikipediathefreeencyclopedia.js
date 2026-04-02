/**
 * Auto-generated Rule for Wikipedia, the free encyclopedia
 */
module.exports = function(text, nlu) {
  if (/\b(wikipediathefreeencyclopedia|Wikipedia)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.wikipediathefreeencyclopedia",
      confidence: 1.0,
      entities: { topic: "Wikipedia, the free encyclopedia" }
    };
  }
  return null;
};
