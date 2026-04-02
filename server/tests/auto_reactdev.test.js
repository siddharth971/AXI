/**
 * Auto-generated Test for reactdev
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated reactdev Intent", () => {
  it("should securely map to knowledge.dynamic.reactdev with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about reactdev please");
    assert.strictEqual(res.intent, "knowledge.dynamic.reactdev");
    assert.strictEqual(res.confidence, 1.0);
  });
});
