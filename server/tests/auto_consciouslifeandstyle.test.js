/**
 * Auto-generated Test for consciouslifeandstyle
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated consciouslifeandstyle Intent", () => {
  it("should securely map to knowledge.dynamic.consciouslifeandstyle with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about consciouslifeandstyle please");
    assert.strictEqual(res.intent, "knowledge.dynamic.consciouslifeandstyle");
    assert.strictEqual(res.confidence, 1.0);
  });
});
