/**
 * Auto-generated Rule for National University I Earn Your Degree Online
 */
module.exports = function(text, nlu) {
  if (/\b(nationaluniversityiearnyourdegreeonline|National)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.nationaluniversityiearnyourdegreeonline",
      confidence: 1.0,
      entities: { topic: "National University I Earn Your Degree Online" }
    };
  }
  return null;
};
