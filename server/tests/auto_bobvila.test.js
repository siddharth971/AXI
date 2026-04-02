/**
 * Auto-generated Test for bobvila
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated bobvila Intent", () => {
  it("should securely map to knowledge.dynamic.bobvila with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about bobvila please");
    assert.strictEqual(res.intent, "knowledge.dynamic.bobvila");
    assert.strictEqual(res.confidence, 1.0);
  });
});
