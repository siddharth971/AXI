/**
 * Auto-generated Rule for Site is offline
 */
module.exports = function(text, nlu) {
  if (/\b(siteisoffline|Site)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.siteisoffline",
      confidence: 1.0,
      entities: { topic: "Site is offline" }
    };
  }
  return null;
};
