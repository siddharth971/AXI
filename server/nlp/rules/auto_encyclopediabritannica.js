/**
 * Auto-generated Rule for Encyclopedia Britannica
 */
module.exports = function(text, nlu) {
  if (/\b(encyclopediabritannica|Encyclopedia)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.encyclopediabritannica",
      confidence: 1.0,
      entities: { topic: "Encyclopedia Britannica" }
    };
  }
  return null;
};
