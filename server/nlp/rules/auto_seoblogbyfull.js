/**
 * Auto-generated Rule for SEO blog by full
 */
module.exports = function(text, nlu) {
  if (/\b(seoblogbyfull|SEO)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.seoblogbyfull",
      confidence: 1.0,
      entities: { topic: "SEO blog by full" }
    };
  }
  return null;
};
