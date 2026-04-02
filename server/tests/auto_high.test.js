/**
 * Auto-generated Test for high
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated high Intent", () => {
  it("should securely map to knowledge.dynamic.high with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about high please");
    assert.strictEqual(res.intent, "knowledge.dynamic.high");
    assert.strictEqual(res.confidence, 1.0);
  });
});
