/**
 * Auto-generated Test for dailycoin
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated dailycoin Intent", () => {
  it("should securely map to knowledge.dynamic.dailycoin with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about dailycoin please");
    assert.strictEqual(res.intent, "knowledge.dynamic.dailycoin");
    assert.strictEqual(res.confidence, 1.0);
  });
});
