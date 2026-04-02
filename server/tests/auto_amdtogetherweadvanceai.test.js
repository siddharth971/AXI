/**
 * Auto-generated Test for amdtogetherweadvanceai
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated amdtogetherweadvanceai Intent", () => {
  it("should securely map to knowledge.dynamic.amdtogetherweadvanceai with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about amdtogetherweadvanceai please");
    assert.strictEqual(res.intent, "knowledge.dynamic.amdtogetherweadvanceai");
    assert.strictEqual(res.confidence, 1.0);
  });
});
