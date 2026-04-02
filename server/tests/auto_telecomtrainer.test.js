/**
 * Auto-generated Test for telecomtrainer
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated telecomtrainer Intent", () => {
  it("should securely map to knowledge.dynamic.telecomtrainer with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about telecomtrainer please");
    assert.strictEqual(res.intent, "knowledge.dynamic.telecomtrainer");
    assert.strictEqual(res.confidence, 1.0);
  });
});
