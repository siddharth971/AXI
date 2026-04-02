/**
 * Auto-generated Rule for National Institute of Standards and Technology
 */
module.exports = function(text, nlu) {
  if (/\b(nationalinstituteofstandardsandtechnology|National)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.nationalinstituteofstandardsandtechnology",
      confidence: 1.0,
      entities: { topic: "National Institute of Standards and Technology" }
    };
  }
  return null;
};
