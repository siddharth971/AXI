/**
 * Auto-generated Rule for Arlington, Ma Roofing Company: Residential &amp; Commercial
 */
module.exports = function(text, nlu) {
  if (/\b(arlingtonmaroofingcompanyresidentialampcommercial|Arlington)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.arlingtonmaroofingcompanyresidentialampcommercial",
      confidence: 1.0,
      entities: { topic: "Arlington, Ma Roofing Company: Residential &amp; Commercial" }
    };
  }
  return null;
};
