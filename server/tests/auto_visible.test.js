/**
 * Auto-generated Test for visible
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated visible Intent", () => {
  it("should securely map to knowledge.dynamic.visible with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about visible please");
    assert.strictEqual(res.intent, "knowledge.dynamic.visible");
    assert.strictEqual(res.confidence, 1.0);
  });
});
