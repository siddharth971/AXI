/**
 * Auto-generated Test for researchgate
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated researchgate Intent", () => {
  it("should securely map to knowledge.dynamic.researchgate with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about researchgate please");
    assert.strictEqual(res.intent, "knowledge.dynamic.researchgate");
    assert.strictEqual(res.confidence, 1.0);
  });
});
