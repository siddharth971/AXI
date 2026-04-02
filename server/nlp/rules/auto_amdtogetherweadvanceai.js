/**
 * Auto-generated Rule for AMD ׀ together we advance_AI
 */
module.exports = function(text, nlu) {
  if (/\b(amdtogetherweadvanceai|AMD)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.amdtogetherweadvanceai",
      confidence: 1.0,
      entities: { topic: "AMD ׀ together we advance_AI" }
    };
  }
  return null;
};
