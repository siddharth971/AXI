/**
 * Auto-generated Rule for LFX Insights
 */
module.exports = function(text, nlu) {
  if (/\b(lfxinsights|LFX)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.lfxinsights",
      confidence: 1.0,
      entities: { topic: "LFX Insights" }
    };
  }
  return null;
};
