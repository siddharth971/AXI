/**
 * Auto-generated Rule for Welcome to nginx!
 */
module.exports = function(text, nlu) {
  if (/\b(welcometonginx|Welcome)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.welcometonginx",
      confidence: 1.0,
      entities: { topic: "Welcome to nginx!" }
    };
  }
  return null;
};
