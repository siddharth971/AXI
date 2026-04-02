/**
 * Auto-generated Rule for HubSpot Blog
 */
module.exports = function(text, nlu) {
  if (/\b(hubspotblog|HubSpot)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.hubspotblog",
      confidence: 1.0,
      entities: { topic: "HubSpot Blog" }
    };
  }
  return null;
};
