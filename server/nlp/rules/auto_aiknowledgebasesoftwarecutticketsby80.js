/**
 * Auto-generated Rule for AI Knowledge Base Software Cut Tickets by 80%
 */
module.exports = function(text, nlu) {
  if (/\b(aiknowledgebasesoftwarecutticketsby80|AI)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.aiknowledgebasesoftwarecutticketsby80",
      confidence: 1.0,
      entities: { topic: "AI Knowledge Base Software Cut Tickets by 80%" }
    };
  }
  return null;
};
