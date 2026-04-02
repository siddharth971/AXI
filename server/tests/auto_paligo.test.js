/**
 * Auto-generated Test for paligo
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated paligo Intent", () => {
  it("should securely map to knowledge.dynamic.paligo with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about paligo please");
    assert.strictEqual(res.intent, "knowledge.dynamic.paligo");
    assert.strictEqual(res.confidence, 1.0);
  });
});
