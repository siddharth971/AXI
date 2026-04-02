/**
 * Auto-generated Test for amdcustomercommunity
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated amdcustomercommunity Intent", () => {
  it("should securely map to knowledge.dynamic.amdcustomercommunity with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about amdcustomercommunity please");
    assert.strictEqual(res.intent, "knowledge.dynamic.amdcustomercommunity");
    assert.strictEqual(res.confidence, 1.0);
  });
});
