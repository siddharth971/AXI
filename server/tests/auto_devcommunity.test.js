/**
 * Auto-generated Test for devcommunity
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated devcommunity Intent", () => {
  it("should securely map to knowledge.dynamic.devcommunity with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about devcommunity please");
    assert.strictEqual(res.intent, "knowledge.dynamic.devcommunity");
    assert.strictEqual(res.confidence, 1.0);
  });
});
