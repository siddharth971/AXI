/**
 * Auto-generated Test for reddit
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated reddit Intent", () => {
  it("should securely map to knowledge.dynamic.reddit with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about reddit please");
    assert.strictEqual(res.intent, "knowledge.dynamic.reddit");
    assert.strictEqual(res.confidence, 1.0);
  });
});
