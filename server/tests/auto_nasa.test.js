/**
 * Auto-generated Test for nasa
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated nasa Intent", () => {
  it("should securely map to knowledge.dynamic.nasa with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about nasa please");
    assert.strictEqual(res.intent, "knowledge.dynamic.nasa");
    assert.strictEqual(res.confidence, 1.0);
  });
});
