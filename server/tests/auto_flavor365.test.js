/**
 * Auto-generated Test for flavor365
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated flavor365 Intent", () => {
  it("should securely map to knowledge.dynamic.flavor365 with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about flavor365 please");
    assert.strictEqual(res.intent, "knowledge.dynamic.flavor365");
    assert.strictEqual(res.confidence, 1.0);
  });
});
