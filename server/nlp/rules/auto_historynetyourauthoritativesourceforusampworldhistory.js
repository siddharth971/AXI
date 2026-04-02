/**
 * Auto-generated Rule for HistoryNet: Your Authoritative Source for U.S. &amp; World History
 */
module.exports = function(text, nlu) {
  if (/\b(historynetyourauthoritativesourceforusampworldhistory|HistoryNet)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.historynetyourauthoritativesourceforusampworldhistory",
      confidence: 1.0,
      entities: { topic: "HistoryNet: Your Authoritative Source for U.S. &amp; World History" }
    };
  }
  return null;
};
