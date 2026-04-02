/**
 * Auto-generated Rule for InvGate ITSM blog
 */
module.exports = function(text, nlu) {
  if (/\b(invgateitsmblog|InvGate)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.invgateitsmblog",
      confidence: 1.0,
      entities: { topic: "InvGate ITSM blog" }
    };
  }
  return null;
};
