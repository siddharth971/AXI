/**
 * Auto-generated Rule for The Spruce: Make Your Best Home
 */
module.exports = function(text, nlu) {
  if (/\b(thesprucemakeyourbesthome|The)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.thesprucemakeyourbesthome",
      confidence: 1.0,
      entities: { topic: "The Spruce: Make Your Best Home" }
    };
  }
  return null;
};
