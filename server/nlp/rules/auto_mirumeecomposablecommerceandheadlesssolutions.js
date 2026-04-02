/**
 * Auto-generated Rule for Mirumee: Composable Commerce and Headless Solutions
 */
module.exports = function(text, nlu) {
  if (/\b(mirumeecomposablecommerceandheadlesssolutions|Mirumee)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.mirumeecomposablecommerceandheadlesssolutions",
      confidence: 1.0,
      entities: { topic: "Mirumee: Composable Commerce and Headless Solutions" }
    };
  }
  return null;
};
