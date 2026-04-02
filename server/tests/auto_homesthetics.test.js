/**
 * Auto-generated Test for homesthetics
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated homesthetics Intent", () => {
  it("should securely map to knowledge.dynamic.homesthetics with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about homesthetics please");
    assert.strictEqual(res.intent, "knowledge.dynamic.homesthetics");
    assert.strictEqual(res.confidence, 1.0);
  });
});
