/**
 * Auto-generated Rule for Join Us in the Fight to Save our Planet
 */
module.exports = function(text, nlu) {
  if (/\b(joinusinthefighttosaveourplanet|Join)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.joinusinthefighttosaveourplanet",
      confidence: 1.0,
      entities: { topic: "Join Us in the Fight to Save our Planet" }
    };
  }
  return null;
};
