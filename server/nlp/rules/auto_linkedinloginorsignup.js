/**
 * Auto-generated Rule for LinkedIn: Log In or Sign Up
 */
module.exports = function(text, nlu) {
  if (/\b(linkedinloginorsignup|LinkedIn)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.linkedinloginorsignup",
      confidence: 1.0,
      entities: { topic: "LinkedIn: Log In or Sign Up" }
    };
  }
  return null;
};
