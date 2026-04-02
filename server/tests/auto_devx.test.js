/**
 * Auto-generated Test for devx
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated devx Intent", () => {
  it("should securely map to knowledge.dynamic.devx with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about devx please");
    assert.strictEqual(res.intent, "knowledge.dynamic.devx");
    assert.strictEqual(res.confidence, 1.0);
  });
});
