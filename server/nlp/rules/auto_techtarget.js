/**
 * Auto-generated Rule for TechTarget
 */
module.exports = function(text, nlu) {
  if (/\b(techtarget|TechTarget)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.techtarget",
      confidence: 1.0,
      entities: { topic: "TechTarget" }
    };
  }
  return null;
};
