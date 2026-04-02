/**
 * Auto-generated Rule for Home Page
 */
module.exports = function(text, nlu) {
  if (/\b(homepage|Home)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.homepage",
      confidence: 1.0,
      entities: { topic: "Home Page" }
    };
  }
  return null;
};
