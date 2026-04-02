/**
 * Auto-generated Test for sentinelone
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated sentinelone Intent", () => {
  it("should securely map to knowledge.dynamic.sentinelone with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about sentinelone please");
    assert.strictEqual(res.intent, "knowledge.dynamic.sentinelone");
    assert.strictEqual(res.confidence, 1.0);
  });
});
