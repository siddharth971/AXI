/**
 * Auto-generated Test for invgateitsmblog
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated invgateitsmblog Intent", () => {
  it("should securely map to knowledge.dynamic.invgateitsmblog with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about invgateitsmblog please");
    assert.strictEqual(res.intent, "knowledge.dynamic.invgateitsmblog");
    assert.strictEqual(res.confidence, 1.0);
  });
});
