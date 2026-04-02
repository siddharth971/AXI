/**
 * Auto-generated Rule for OpenHistoricalMap
 */
module.exports = function(text, nlu) {
  if (/\b(openhistoricalmap|OpenHistoricalMap)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.openhistoricalmap",
      confidence: 1.0,
      entities: { topic: "OpenHistoricalMap" }
    };
  }
  return null;
};
