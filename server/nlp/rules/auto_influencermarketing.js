/**
 * Auto-generated Rule for Influencer Marketing
 */
module.exports = function(text, nlu) {
  if (/\b(influencermarketing|Influencer)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.influencermarketing",
      confidence: 1.0,
      entities: { topic: "Influencer Marketing" }
    };
  }
  return null;
};
