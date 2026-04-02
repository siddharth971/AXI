/**
 * Auto-generated Rule for Class Central • Find the best courses, wherever they exist.
 */
module.exports = function(text, nlu) {
  if (/\b(classcentralfindthebestcourseswherevertheyexist|Class)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.classcentralfindthebestcourseswherevertheyexist",
      confidence: 1.0,
      entities: { topic: "Class Central • Find the best courses, wherever they exist." }
    };
  }
  return null;
};
