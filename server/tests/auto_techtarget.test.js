/**
 * Auto-generated Test for techtarget
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated techtarget Intent", () => {
  it("should securely map to knowledge.dynamic.techtarget with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about techtarget please");
    assert.strictEqual(res.intent, "knowledge.dynamic.techtarget");
    assert.strictEqual(res.confidence, 1.0);
  });
});
