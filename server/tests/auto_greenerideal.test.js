/**
 * Auto-generated Test for greenerideal
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated greenerideal Intent", () => {
  it("should securely map to knowledge.dynamic.greenerideal with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about greenerideal please");
    assert.strictEqual(res.intent, "knowledge.dynamic.greenerideal");
    assert.strictEqual(res.confidence, 1.0);
  });
});
