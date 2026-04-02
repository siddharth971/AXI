/**
 * Auto-generated Rule for Narrative · Webflow HTML website template
 */
module.exports = function(text, nlu) {
  if (/\b(narrativewebflowhtmlwebsitetemplate|Narrative)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.narrativewebflowhtmlwebsitetemplate",
      confidence: 1.0,
      entities: { topic: "Narrative · Webflow HTML website template" }
    };
  }
  return null;
};
