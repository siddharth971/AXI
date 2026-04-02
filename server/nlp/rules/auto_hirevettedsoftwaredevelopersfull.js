/**
 * Auto-generated Rule for Hire Vetted Software Developers [Full
 */
module.exports = function(text, nlu) {
  if (/\b(hirevettedsoftwaredevelopersfull|Hire)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.hirevettedsoftwaredevelopersfull",
      confidence: 1.0,
      entities: { topic: "Hire Vetted Software Developers [Full" }
    };
  }
  return null;
};
