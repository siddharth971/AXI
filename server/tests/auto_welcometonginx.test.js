/**
 * Auto-generated Test for welcometonginx
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated welcometonginx Intent", () => {
  it("should securely map to knowledge.dynamic.welcometonginx with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about welcometonginx please");
    assert.strictEqual(res.intent, "knowledge.dynamic.welcometonginx");
    assert.strictEqual(res.confidence, 1.0);
  });
});
