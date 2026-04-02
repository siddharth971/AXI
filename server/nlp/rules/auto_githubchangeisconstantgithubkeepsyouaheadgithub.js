/**
 * Auto-generated Rule for GitHub · Change is constant. GitHub keeps you ahead. · GitHub
 */
module.exports = function(text, nlu) {
  if (/\b(githubchangeisconstantgithubkeepsyouaheadgithub|GitHub)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.githubchangeisconstantgithubkeepsyouaheadgithub",
      confidence: 1.0,
      entities: { topic: "GitHub · Change is constant. GitHub keeps you ahead. · GitHub" }
    };
  }
  return null;
};
