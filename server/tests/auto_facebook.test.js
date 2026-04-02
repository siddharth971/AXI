/**
 * Auto-generated Test for facebook
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated facebook Intent", () => {
  it("should securely map to knowledge.dynamic.facebook with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about facebook please");
    assert.strictEqual(res.intent, "knowledge.dynamic.facebook");
    assert.strictEqual(res.confidence, 1.0);
  });
});
