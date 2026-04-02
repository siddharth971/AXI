/**
 * Auto-generated Rule for DIY Projects for the Home
 */
module.exports = function(text, nlu) {
  if (/\b(diyprojectsforthehome|DIY)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.diyprojectsforthehome",
      confidence: 1.0,
      entities: { topic: "DIY Projects for the Home" }
    };
  }
  return null;
};
