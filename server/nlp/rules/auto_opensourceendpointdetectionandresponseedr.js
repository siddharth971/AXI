/**
 * Auto-generated Rule for Open Source Endpoint Detection and Response (EDR)
 */
module.exports = function(text, nlu) {
  if (/\b(opensourceendpointdetectionandresponseedr|Open)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.opensourceendpointdetectionandresponseedr",
      confidence: 1.0,
      entities: { topic: "Open Source Endpoint Detection and Response (EDR)" }
    };
  }
  return null;
};
