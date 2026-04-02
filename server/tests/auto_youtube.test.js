/**
 * Auto-generated Test for youtube
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated youtube Intent", () => {
  it("should securely map to knowledge.dynamic.youtube with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about youtube please");
    assert.strictEqual(res.intent, "knowledge.dynamic.youtube");
    assert.strictEqual(res.confidence, 1.0);
  });
});
