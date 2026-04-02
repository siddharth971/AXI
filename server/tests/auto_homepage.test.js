/**
 * Auto-generated Test for homepage
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated homepage Intent", () => {
  it("should securely map to knowledge.dynamic.homepage with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about homepage please");
    assert.strictEqual(res.intent, "knowledge.dynamic.homepage");
    assert.strictEqual(res.confidence, 1.0);
  });
});
