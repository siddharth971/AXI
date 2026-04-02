/**
 * Auto-generated Test for open
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated open Intent", () => {
  it("should securely map to knowledge.dynamic.open with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about open please");
    assert.strictEqual(res.intent, "knowledge.dynamic.open");
    assert.strictEqual(res.confidence, 1.0);
  });
});
