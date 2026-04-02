/**
 * Auto-generated Test for torqaisocplatform
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated torqaisocplatform Intent", () => {
  it("should securely map to knowledge.dynamic.torqaisocplatform with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about torqaisocplatform please");
    assert.strictEqual(res.intent, "knowledge.dynamic.torqaisocplatform");
    assert.strictEqual(res.confidence, 1.0);
  });
});
