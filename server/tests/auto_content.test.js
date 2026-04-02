/**
 * Auto-generated Test for content
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated content Intent", () => {
  it("should securely map to knowledge.dynamic.content with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about content please");
    assert.strictEqual(res.intent, "knowledge.dynamic.content");
    assert.strictEqual(res.confidence, 1.0);
  });
});
