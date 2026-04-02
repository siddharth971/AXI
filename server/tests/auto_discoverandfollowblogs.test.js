/**
 * Auto-generated Test for discoverandfollowblogs
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated discoverandfollowblogs Intent", () => {
  it("should securely map to knowledge.dynamic.discoverandfollowblogs with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about discoverandfollowblogs please");
    assert.strictEqual(res.intent, "knowledge.dynamic.discoverandfollowblogs");
    assert.strictEqual(res.confidence, 1.0);
  });
});
