/**
 * Auto-generated Rule for AMD Customer Community
 */
module.exports = function(text, nlu) {
  if (/\b(amdcustomercommunity|AMD)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.amdcustomercommunity",
      confidence: 1.0,
      entities: { topic: "AMD Customer Community" }
    };
  }
  return null;
};
