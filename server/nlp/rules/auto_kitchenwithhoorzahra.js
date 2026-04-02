/**
 * Auto-generated Rule for Kitchen with Hoor Zahra
 */
module.exports = function(text, nlu) {
  if (/\b(kitchenwithhoorzahra|Kitchen)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.kitchenwithhoorzahra",
      confidence: 1.0,
      entities: { topic: "Kitchen with Hoor Zahra" }
    };
  }
  return null;
};
