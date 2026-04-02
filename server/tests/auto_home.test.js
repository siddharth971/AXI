/**
 * Auto-generated Test for home
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated home Intent", () => {
  it("should securely map to knowledge.dynamic.home with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about home please");
    assert.strictEqual(res.intent, "knowledge.dynamic.home");
    assert.strictEqual(res.confidence, 1.0);
  });
});
