/**
 * Auto-generated Rule for Microsoft Source
 */
module.exports = function(text, nlu) {
  if (/\b(microsoftsource|Microsoft)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.microsoftsource",
      confidence: 1.0,
      entities: { topic: "Microsoft Source" }
    };
  }
  return null;
};
