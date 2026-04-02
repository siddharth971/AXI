/**
 * Auto-generated Rule for Facebook
 */
module.exports = function(text, nlu) {
  if (/\b(facebook|Facebook)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.facebook",
      confidence: 1.0,
      entities: { topic: "Facebook" }
    };
  }
  return null;
};
