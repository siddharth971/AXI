/**
 * Auto-generated Rule for The Official Microsoft Blog
 */
module.exports = function(text, nlu) {
  if (/\b(theofficialmicrosoftblog|The)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.theofficialmicrosoftblog",
      confidence: 1.0,
      entities: { topic: "The Official Microsoft Blog" }
    };
  }
  return null;
};
