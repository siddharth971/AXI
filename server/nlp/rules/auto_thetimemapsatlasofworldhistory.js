/**
 * Auto-generated Rule for The Timemaps Atlas of World History
 */
module.exports = function(text, nlu) {
  if (/\b(thetimemapsatlasofworldhistory|The)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.thetimemapsatlasofworldhistory",
      confidence: 1.0,
      entities: { topic: "The Timemaps Atlas of World History" }
    };
  }
  return null;
};
