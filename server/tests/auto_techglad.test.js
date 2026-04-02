/**
 * Auto-generated Test for techglad
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated techglad Intent", () => {
  it("should securely map to knowledge.dynamic.techglad with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about techglad please");
    assert.strictEqual(res.intent, "knowledge.dynamic.techglad");
    assert.strictEqual(res.confidence, 1.0);
  });
});
