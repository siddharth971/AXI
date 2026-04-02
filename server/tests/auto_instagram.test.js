/**
 * Auto-generated Test for instagram
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated instagram Intent", () => {
  it("should securely map to knowledge.dynamic.instagram with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about instagram please");
    assert.strictEqual(res.intent, "knowledge.dynamic.instagram");
    assert.strictEqual(res.confidence, 1.0);
  });
});
