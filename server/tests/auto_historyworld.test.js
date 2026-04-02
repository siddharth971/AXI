/**
 * Auto-generated Test for historyworld
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated historyworld Intent", () => {
  it("should securely map to knowledge.dynamic.historyworld with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about historyworld please");
    assert.strictEqual(res.intent, "knowledge.dynamic.historyworld");
    assert.strictEqual(res.confidence, 1.0);
  });
});
