/**
 * Auto-generated Test for worldhistorycommons
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated worldhistorycommons Intent", () => {
  it("should securely map to knowledge.dynamic.worldhistorycommons with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about worldhistorycommons please");
    assert.strictEqual(res.intent, "knowledge.dynamic.worldhistorycommons");
    assert.strictEqual(res.confidence, 1.0);
  });
});
