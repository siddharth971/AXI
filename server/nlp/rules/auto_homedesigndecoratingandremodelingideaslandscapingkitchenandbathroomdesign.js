/**
 * Auto-generated Rule for Home Design, Decorating and Remodeling Ideas, Landscaping, Kitchen and Bathroom Design
 */
module.exports = function(text, nlu) {
  if (/\b(homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign|Home)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign",
      confidence: 1.0,
      entities: { topic: "Home Design, Decorating and Remodeling Ideas, Landscaping, Kitchen and Bathroom Design" }
    };
  }
  return null;
};
