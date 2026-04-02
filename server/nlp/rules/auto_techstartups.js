/**
 * Auto-generated Rule for Tech Startups
 */
module.exports = function(text, nlu) {
  if (/\b(techstartups|Tech)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.techstartups",
      confidence: 1.0,
      entities: { topic: "Tech Startups" }
    };
  }
  return null;
};
