/**
 * Auto-generated Rule for Torq® AI SOC Platform
 */
module.exports = function(text, nlu) {
  if (/\b(torqaisocplatform|Torq)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.torqaisocplatform",
      confidence: 1.0,
      entities: { topic: "Torq® AI SOC Platform" }
    };
  }
  return null;
};
