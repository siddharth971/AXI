/**
 * Auto-generated Test for kinsta
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated kinsta Intent", () => {
  it("should securely map to knowledge.dynamic.kinsta with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about kinsta please");
    assert.strictEqual(res.intent, "knowledge.dynamic.kinsta");
    assert.strictEqual(res.confidence, 1.0);
  });
});
