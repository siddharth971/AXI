/**
 * Auto-generated Rule for Your Sustainable Guide
 */
module.exports = function(text, nlu) {
  if (/\b(yoursustainableguide|Your)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.yoursustainableguide",
      confidence: 1.0,
      entities: { topic: "Your Sustainable Guide" }
    };
  }
  return null;
};
