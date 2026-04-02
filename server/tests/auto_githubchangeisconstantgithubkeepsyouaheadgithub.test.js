/**
 * Auto-generated Test for githubchangeisconstantgithubkeepsyouaheadgithub
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated githubchangeisconstantgithubkeepsyouaheadgithub Intent", () => {
  it("should securely map to knowledge.dynamic.githubchangeisconstantgithubkeepsyouaheadgithub with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about githubchangeisconstantgithubkeepsyouaheadgithub please");
    assert.strictEqual(res.intent, "knowledge.dynamic.githubchangeisconstantgithubkeepsyouaheadgithub");
    assert.strictEqual(res.confidence, 1.0);
  });
});
