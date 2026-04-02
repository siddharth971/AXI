/**
 * Auto-generated Test for sustainablelivingblog
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated sustainablelivingblog Intent", () => {
  it("should securely map to knowledge.dynamic.sustainablelivingblog with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about sustainablelivingblog please");
    assert.strictEqual(res.intent, "knowledge.dynamic.sustainablelivingblog");
    assert.strictEqual(res.confidence, 1.0);
  });
});
