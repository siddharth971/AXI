/**
 * Auto-generated Test for yoursustainableguide
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated yoursustainableguide Intent", () => {
  it("should securely map to knowledge.dynamic.yoursustainableguide with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about yoursustainableguide please");
    assert.strictEqual(res.intent, "knowledge.dynamic.yoursustainableguide");
    assert.strictEqual(res.confidence, 1.0);
  });
});
