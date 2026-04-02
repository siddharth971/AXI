/**
 * Auto-generated Test for livescience
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated livescience Intent", () => {
  it("should securely map to knowledge.dynamic.livescience with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about livescience please");
    assert.strictEqual(res.intent, "knowledge.dynamic.livescience");
    assert.strictEqual(res.confidence, 1.0);
  });
});
