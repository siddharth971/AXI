/**
 * Auto-generated Rule for HistoryWorld
 */
module.exports = function(text, nlu) {
  if (/\b(historyworld|HistoryWorld)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.historyworld",
      confidence: 1.0,
      entities: { topic: "HistoryWorld" }
    };
  }
  return null;
};
