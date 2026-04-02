/**
 * Auto-generated Test for phoenixnapdatacenterdedicatedserverscloudampcolocation
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated phoenixnapdatacenterdedicatedserverscloudampcolocation Intent", () => {
  it("should securely map to knowledge.dynamic.phoenixnapdatacenterdedicatedserverscloudampcolocation with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about phoenixnapdatacenterdedicatedserverscloudampcolocation please");
    assert.strictEqual(res.intent, "knowledge.dynamic.phoenixnapdatacenterdedicatedserverscloudampcolocation");
    assert.strictEqual(res.confidence, 1.0);
  });
});
