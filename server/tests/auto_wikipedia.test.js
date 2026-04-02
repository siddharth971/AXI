/**
 * Auto-generated Test for wikipedia
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated wikipedia Intent", () => {
  it("should securely map to knowledge.dynamic.wikipedia with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about wikipedia please");
    assert.strictEqual(res.intent, "knowledge.dynamic.wikipedia");
    assert.strictEqual(res.confidence, 1.0);
  });
});
