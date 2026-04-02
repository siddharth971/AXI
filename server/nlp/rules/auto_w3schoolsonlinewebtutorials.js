/**
 * Auto-generated Rule for W3Schools Online Web Tutorials
 */
module.exports = function(text, nlu) {
  if (/\b(w3schoolsonlinewebtutorials|W3Schools)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.w3schoolsonlinewebtutorials",
      confidence: 1.0,
      entities: { topic: "W3Schools Online Web Tutorials" }
    };
  }
  return null;
};
